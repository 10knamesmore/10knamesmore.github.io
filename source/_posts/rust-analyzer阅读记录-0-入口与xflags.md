---
title: "rust-analyzer阅读记录(0): 入口与main函数"
date: 2026-02-03 22:57:48
tags: rust, 源码
---

## before all

rust-analyzer 是一个为 rust 语言提供的 [LSP](https://microsoft.github.io/language-server-protocol/overviews/lsp/overview/), 提供了代码补全, 语法检查, 跳转, 重构, [格式化, lint](https://rust-analyzer.github.io/book/index.html)等功能

[这个合集](https://www.youtube.com/playlist?list=PLhb66M_x9UmrqXhQuIpWC5VgTdrGxMx3y) 是更详细的解释

[RA 仓库](https://github.com/rust-lang/rust-analyzer.git)

ra 二进制入口位置在 [这](https://github.com/rust-lang/rust-analyzer/blob/master/crates/rust-analyzer/src/bin/main.rs)

![主函数入口](ra入口.png)

rustc_wrapper 先跳过, 看`RustAnalyzer::from_env_or_exit()`的实现函数

## 命令行解析

![xflag](xflags_use.png)

[xflags](https://docs.rs/xflags/latest/xflags/) 是 rust-analyzer 自定义的命令行参数解析库

而 xflags:xflags! {} 是一个**function like 过程宏**

```rust
#[proc_macro]
pub fn xflags(_ts: proc_macro::TokenStream) -> proc_macro::TokenStream {
    // Stub out the code, but let rust-analyzer resolve the invocation
    #[cfg(not(test))]
    {
        let text = match parse::xflags(_ts) {
            Ok(cmd) => emit::emit(&cmd),
            Err(err) => format!("compile_error!(\"invalid flags syntax, {err}\");"),
        };
        text.parse().unwrap()
    }
    #[cfg(test)]
    unimplemented!()
}
```

为什么不用声明宏? 看内部实现

```rust
pub(crate) fn xflags(ts: TokenStream) -> Result<ast::XFlags> {
    let p = &mut Parser::new(ts);
    let src = if p.eat_keyword("src") { Some(p.expect_string()?) } else { None };
    let doc = opt_doc(p)?;
    let mut cmd = cmd(p)?;
    cmd.doc = doc;
    add_help(&mut cmd);
    let res = ast::XFlags { src, cmd };
    Ok(res)
}
```

这里是对 dsl 的解析, 生成命令行参数的解析

```rust
pub(crate) fn emit(xflags: &ast::XFlags) -> String {
    let mut buf = String::new();

    if xflags.is_anon() {
        w!(buf, "{{\n");
    }

    emit_cmd(&mut buf, &xflags.cmd);
    blank_line(&mut buf);
    emit_api(&mut buf, xflags);

    if !xflags.is_anon() && env::var("UPDATE_XFLAGS").is_ok() {
        if let Some(src) = &xflags.src {
            update::in_place(&buf, Path::new(src.as_str()))
        } else {
            update::stdout(&buf);
        }
    }

    if xflags.src.is_some() {
        buf.clear()
    }

    blank_line(&mut buf);
    emit_impls(&mut buf, xflags);
    emit_help(&mut buf, xflags);

    if xflags.is_anon() {
        w!(buf, "Flags::from_env_or_exit()");
        w!(buf, "}}\n");
    }

    buf
}
```

骚操作是这里的emit, 当使用 `UPDATE_XFLAGS=1 cargo build` 编译时, 会把生成的代码写回到源文件中

不启用就stdout

```rust
pub(crate) fn in_place(api: &str, path: &Path) {
    let path = {
        let dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
        Path::new(&dir).join(path)
    };

    let mut text = fs::read_to_string(&path).unwrap_or_else(|_| panic!("failed to read {path:?}"));

    let (insert_to, indent) = locate(&text);

    let api: String =
        with_preamble(api)
            .lines()
            .map(|it| {
                if it.trim().is_empty() {
                    "\n".to_string()
                } else {
                    format!("{}{}\n", indent, it)
                }
            })
            .collect();
    text.replace_range(insert_to, &api);

    fs::write(&path, text.as_bytes()).unwrap();
}
```

先读成string, 修改后写回, 相当于一个离线的元编程

真的是如果不去别人优秀的轮子/项目, 我是想不出来这么玩的...

## 等待 debugger

```rust
#[cfg(debug_assertions)]
if flags.wait_dbg || env::var("RA_WAIT_DBG").is_ok() {
    wait_for_debugger();
}


#[cfg(debug_assertions)]
fn wait_for_debugger() {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::System::Diagnostics::Debug::IsDebuggerPresent;
        // SAFETY: WinAPI generated code that is defensively marked `unsafe` but
        // in practice can not be used in an unsafe way.
        while unsafe { IsDebuggerPresent() } == 0 {
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        #[allow(unused_mut)]
        let mut d = 4;
        while d == 4 {
            d = 4;
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
    }
}
```

这个 IsDebuggerPresent(), 引用 AI 原话:

> IsDebuggerPresent 是 Windows 专有 的 Win32 API（在 Kernel32/Debug 相关接口里，MSDN/Windows SDK 定义）。
>
> 它检查当前进程是否处于调试状态。底层实现通常会读取进程环境块（PEB, Process Environment Block）里的 BeingDebugged 标志位；如果被调试，这个标志会被系统设置为 1。
>
> 所以它本质上是“系统级的调试状态查询”，只在 Windows 上有。其他平台没有统一等价 API。

就不去细究了

在非 win上, 这很明显是一个死循环, 实现方法就是一直自旋, 等待 debugger attach, 修改内部变量 d 的值后跳出循环

[1](https://www.bilibili.com/video/BV1wPK8z9Eqg/) [2](https://www.bilibili.com/video/BV1r4itBNEF2/) 这两个视频简单讲了 debugger 的原理, 我反正是达到扫盲的目的就行了.

## 初始化日志

```rust
fn setup_logging(log_file_flag: Option<PathBuf>) -> anyhow::Result<()> {
    if cfg!(windows) {
        // This is required so that windows finds our pdb that is placed right beside the exe.
        // By default it doesn't look at the folder the exe resides in, only in the current working
        // directory which we set to the project workspace.
        // https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/general-environment-variables
        // https://docs.microsoft.com/en-us/windows/win32/api/dbghelp/nf-dbghelp-syminitialize
        if let Ok(path) = env::current_exe()
            && let Some(path) = path.parent()
        {
            // SAFETY: This is safe because this is single-threaded.
            unsafe {
                env::set_var("_NT_SYMBOL_PATH", path);
            }
        }
    }

    if env::var("RUST_BACKTRACE").is_err() {
        // SAFETY: This is safe because this is single-threaded.
        unsafe {
            env::set_var("RUST_BACKTRACE", "short");
        }
    }

    let log_file = env::var("RA_LOG_FILE").ok().map(PathBuf::from).or(log_file_flag);
    let log_file = match log_file {
        Some(path) => {
            if let Some(parent) = path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            Some(
                fs::File::create(&path)
                    .with_context(|| format!("can't create log file at {}", path.display()))?,
            )
        }
        None => None,
    };

    let writer = match log_file {
        Some(file) => BoxMakeWriter::new(Arc::new(file)),
        None => BoxMakeWriter::new(std::io::stderr),
    };

    rust_analyzer::tracing::Config {
        writer,
        // Deliberately enable all `warn` logs if the user has not set RA_LOG, as there is usually
        // useful information in there for debugging.
        filter: env::var("RA_LOG").ok().unwrap_or_else(|| "warn".to_owned()),
        chalk_filter: env::var("CHALK_DEBUG").ok(),
        profile_filter: env::var("RA_PROFILE").ok(),
        json_profile_filter: std::env::var("RA_PROFILE_JSON").ok(),
    }
    .init()?;

    Ok(())
}
```

这个没什么好讲的, 设置了 `RA_LOG_FILE` 环境变量就把日志写到文件, 否则写到 stderr

为什么不写 stdout? 因为 rust-analyzer 是一个 LSP 服务器, stdout 是和客户端通信的管道

## cmd 分发

```rust
match flags.subcommand {
    flags::RustAnalyzerCmd::LspServer(cmd) => 'lsp_server: {
        if cmd.print_config_schema {
            println!("{:#}", Config::json_schema());
            break 'lsp_server;
        }
        if cmd.version {
            println!("rust-analyzer {}", rust_analyzer::version());
            break 'lsp_server;
        }

        // rust-analyzer’s “main thread” is actually
        // a secondary latency-sensitive thread with an increased stack size.
        // We use this thread intent because any delay in the main loop
        // will make actions like hitting enter in the editor slow.
        with_extra_thread(
            "LspServer",
            stdx::thread::ThreadIntent::LatencySensitive,
            run_server,
        )?;
    }
    flags::RustAnalyzerCmd::Parse(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::Symbols(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::Highlight(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::AnalysisStats(cmd) => cmd.run(verbosity)?,
    flags::RustAnalyzerCmd::Diagnostics(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::UnresolvedReferences(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::Ssr(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::Search(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::Lsif(cmd) => {
        cmd.run(&mut std::io::stdout(), Some(project_model::RustLibSource::Discover))?
    }
    flags::RustAnalyzerCmd::Scip(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::RunTests(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::RustcTests(cmd) => cmd.run()?,
    flags::RustAnalyzerCmd::PrimeCaches(cmd) => cmd.run()?,
}
```

下面就是根据 命令行参数分发到不同的子命令处理函数

`'lsp_server` 是一个 rust的[label](https://doc.rust-lang.org/rust-by-example/flow_control/loop/nested.html)

延迟敏感听起来有点意思, 进去看看

```rust
const STACK_SIZE: usize = 1024 * 1024 * 8;

/// Parts of rust-analyzer can use a lot of stack space, and some operating systems only give us
/// 1 MB by default (eg. Windows), so this spawns a new thread with hopefully sufficient stack
/// space.
fn with_extra_thread(
    thread_name: impl Into<String>,
    thread_intent: stdx::thread::ThreadIntent,
    f: impl FnOnce() -> anyhow::Result<()> + Send + 'static,
) -> anyhow::Result<()> {
    let handle =
        stdx::thread::Builder::new(thread_intent, thread_name).stack_size(STACK_SIZE).spawn(f)?;

    handle.join()?;

    Ok(())
}
```

这里默认设置了一个 8MB 的栈空间, 通过 `stdx::thread::Builder` 创建一个新线程运行 LSP 服务器的主循环

### stdx::thread

stdx 是 rust-analyzer 自己的一个扩展库

```rust
pub struct JoinHandle<T = ()> {
    // `inner` is an `Option` so that we can
    // take ownership of the contained `JoinHandle`.
    inner: Option<jod_thread::JoinHandle<T>>,
    allow_leak: bool,
}
```

他的joinhandle 是 [jod_thread](https://docs.rs/jod-thread/latest/jod_thread/) 的一个thin wrapper, which is a Join On Drop thread implementation, which is a thin wrapper of std::thread.

jod_thread 就理解成 RAII 风格的线程句柄, 离开作用域就 join 掉

### thread_intent

builder 模式的实现看最后的 sparn

```rust
pub fn spawn<F, T>(self, f: F) -> std::io::Result<JoinHandle<T>>
where
    F: (FnOnce() -> T) + Send + 'static,
    T: Send + 'static,
{
    let inner_handle = self.inner.spawn(move || {
        self.intent.apply_to_current_thread();
        f()
    })?;

    Ok(JoinHandle { inner: Some(inner_handle), allow_leak: self.allow_leak })
}
```

就是在创建线程的基础上应用了 intent

```rust
//! An opaque façade around platform-specific `QoS` APIs.

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
// Please maintain order from least to most priority for the derived `Ord` impl.
pub enum ThreadIntent {
    /// Any thread which does work that isn't in the critical path of the user typing
    /// (e.g. processing Go To Definition).
    Worker,

    /// Any thread which does work caused by the user typing
    /// (e.g. processing syntax highlighting).
    LatencySensitive,
}
```

看起来这里的 intent 主要是给不同优先级的线程设置不同的 QoS (Quality of Service) 策略

```rust
impl ThreadIntent {
    // These APIs must remain private;
    // we only want consumers to set thread intent
    // either during thread creation or using our pool impl.

    pub(super) fn apply_to_current_thread(self) {
        let class = thread_intent_to_qos_class(self);
        set_current_thread_qos_class(class);
    }

    pub(super) fn assert_is_used_on_current_thread(self) {
        if IS_QOS_AVAILABLE {
            let class = thread_intent_to_qos_class(self);
            assert_eq!(get_current_thread_qos_class(), Some(class));
        }
    }
}

use imp::QoSClass;

const IS_QOS_AVAILABLE: bool = imp::IS_QOS_AVAILABLE;

#[expect(clippy::semicolon_if_nothing_returned, reason = "thin wrapper")]
fn set_current_thread_qos_class(class: QoSClass) {
    imp::set_current_thread_qos_class(class)
}

fn get_current_thread_qos_class() -> Option<QoSClass> {
    imp::get_current_thread_qos_class()
}

fn thread_intent_to_qos_class(intent: ThreadIntent) -> QoSClass {
    imp::thread_intent_to_qos_class(intent)
}

// All Apple platforms use XNU as their kernel
// and thus have the concept of QoS.
#[cfg(target_vendor = "apple")]
mod imp {
    use super::ThreadIntent;

    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
    // Please maintain order from least to most priority for the derived `Ord` impl.
    pub(super) enum QoSClass {
        // Documentation adapted from https://github.com/apple-oss-distributions/libpthread/blob/67e155c94093be9a204b69637d198eceff2c7c46/include/sys/qos.h#L55
        //
        /// TLDR: invisible maintenance tasks
        ///
        /// Contract:
        ///
        /// * **You do not care about how long it takes for work to finish.**
        /// * **You do not care about work being deferred temporarily.**
        ///   (e.g. if the device's battery is in a critical state)
        ///
        /// Examples:
        ///
        /// * in a video editor:
        ///   creating periodic backups of project files
        /// * in a browser:
        ///   cleaning up cached sites which have not been accessed in a long time
        /// * in a collaborative word processor:
        ///   creating a searchable index of all documents
        ///
        /// Use this QoS class for background tasks
        /// which the user did not initiate themselves
        /// and which are invisible to the user.
        /// It is expected that this work will take significant time to complete:
        /// minutes or even hours.
        ///
        /// This QoS class provides the most energy and thermally-efficient execution possible.
        /// All other work is prioritized over background tasks.
        Background,

        /// TLDR: tasks that don't block using your app
        ///
        /// Contract:
        ///
        /// * **Your app remains useful even as the task is executing.**
        ///
        /// Examples:
        ///
        /// * in a video editor:
        ///   exporting a video to disk –
        ///   the user can still work on the timeline
        /// * in a browser:
        ///   automatically extracting a downloaded zip file –
        ///   the user can still switch tabs
        /// * in a collaborative word processor:
        ///   downloading images embedded in a document –
        ///   the user can still make edits
        ///
        /// Use this QoS class for tasks which
        /// may or may not be initiated by the user,
        /// but whose result is visible.
        /// It is expected that this work will take a few seconds to a few minutes.
        /// Typically your app will include a progress bar
        /// for tasks using this class.
        ///
        /// This QoS class provides a balance between
        /// performance, responsiveness, and efficiency.
        Utility,

        /// TLDR: tasks that block using your app
        ///
        /// Contract:
        ///
        /// * **You need this work to complete
        ///   before the user can keep interacting with your app.**
        /// * **Your work will not take more than a few seconds to complete.**
        ///
        /// Examples:
        ///
        /// * in a video editor:
        ///   opening a saved project
        /// * in a browser:
        ///   loading a list of the user's bookmarks and top sites
        ///   when a new tab is created
        /// * in a collaborative word processor:
        ///   running a search on the document's content
        ///
        /// Use this QoS class for tasks which were initiated by the user
        /// and block the usage of your app while they are in progress.
        /// It is expected that this work will take a few seconds or less to complete;
        /// not long enough to cause the user to switch to something else.
        /// Your app will likely indicate progress on these tasks
        /// through the display of placeholder content or modals.
        ///
        /// This QoS class is not energy-efficient.
        /// Rather, it provides responsiveness
        /// by prioritizing work above other tasks on the system
        /// except for critical user-interactive work.
        UserInitiated,

        /// TLDR: render loops and nothing else
        ///
        /// Contract:
        ///
        /// * **You absolutely need this work to complete immediately
        ///   or your app will appear to freeze.**
        /// * **Your work will always complete virtually instantaneously.**
        ///
        /// Examples:
        ///
        /// * the main thread in a GUI application
        /// * the update & render loop in a game
        /// * a secondary thread which progresses an animation
        ///
        /// Use this QoS class for any work which, if delayed,
        /// will make your user interface unresponsive.
        /// It is expected that this work will be virtually instantaneous.
        ///
        /// This QoS class is not energy-efficient.
        /// Specifying this class is a request to run with
        /// nearly all available system CPU and I/O bandwidth even under contention.
        UserInteractive,
    }

    pub(super) const IS_QOS_AVAILABLE: bool = true;

    pub(super) fn set_current_thread_qos_class(class: QoSClass) {
        let c = match class {
            QoSClass::UserInteractive => libc::qos_class_t::QOS_CLASS_USER_INTERACTIVE,
            QoSClass::UserInitiated => libc::qos_class_t::QOS_CLASS_USER_INITIATED,
            QoSClass::Utility => libc::qos_class_t::QOS_CLASS_UTILITY,
            QoSClass::Background => libc::qos_class_t::QOS_CLASS_BACKGROUND,
        };

        let code = unsafe { libc::pthread_set_qos_class_self_np(c, 0) };

        if code == 0 {
            return;
        }

        let errno = unsafe { *libc::__error() };

        match errno {
            libc::EPERM => {
                // This thread has been excluded from the QoS system
                // due to a previous call to a function such as `pthread_setschedparam`
                // which is incompatible with QoS.
                //
                // Panic instead of returning an error
                // to maintain the invariant that we only use QoS APIs.
                panic!("tried to set QoS of thread which has opted out of QoS (os error {errno})")
            }

            libc::EINVAL => {
                // This is returned if we pass something other than a qos_class_t
                // to `pthread_set_qos_class_self_np`.
                //
                // This is impossible, so again panic.
                unreachable!(
                    "invalid qos_class_t value was passed to pthread_set_qos_class_self_np"
                )
            }

            _ => {
                // `pthread_set_qos_class_self_np`'s documentation
                // does not mention any other errors.
                unreachable!("`pthread_set_qos_class_self_np` returned unexpected error {errno}")
            }
        }
    }

    pub(super) fn get_current_thread_qos_class() -> Option<QoSClass> {
        let current_thread = unsafe { libc::pthread_self() };
        let mut qos_class_raw = libc::qos_class_t::QOS_CLASS_UNSPECIFIED;
        let code = unsafe {
            libc::pthread_get_qos_class_np(current_thread, &mut qos_class_raw, std::ptr::null_mut())
        };

        if code != 0 {
            // `pthread_get_qos_class_np`'s documentation states that
            // an error value is placed into errno if the return code is not zero.
            // However, it never states what errors are possible.
            // Inspecting the source[0] shows that, as of this writing, it always returns zero.
            //
            // Whatever errors the function could report in future are likely to be
            // ones which we cannot handle anyway
            //
            // 0: https://github.com/apple-oss-distributions/libpthread/blob/67e155c94093be9a204b69637d198eceff2c7c46/src/qos.c#L171-L177
            let errno = unsafe { *libc::__error() };
            unreachable!("`pthread_get_qos_class_np` failed unexpectedly (os error {errno})");
        }

        match qos_class_raw {
            libc::qos_class_t::QOS_CLASS_USER_INTERACTIVE => Some(QoSClass::UserInteractive),
            libc::qos_class_t::QOS_CLASS_USER_INITIATED => Some(QoSClass::UserInitiated),
            libc::qos_class_t::QOS_CLASS_DEFAULT => None, // QoS has never been set
            libc::qos_class_t::QOS_CLASS_UTILITY => Some(QoSClass::Utility),
            libc::qos_class_t::QOS_CLASS_BACKGROUND => Some(QoSClass::Background),

            libc::qos_class_t::QOS_CLASS_UNSPECIFIED => {
                // Using manual scheduling APIs causes threads to “opt out” of QoS.
                // At this point they become incompatible with QoS,
                // and as such have the “unspecified” QoS class.
                //
                // Panic instead of returning an error
                // to maintain the invariant that we only use QoS APIs.
                panic!("tried to get QoS of thread which has opted out of QoS")
            }
        }
    }

    pub(super) fn thread_intent_to_qos_class(intent: ThreadIntent) -> QoSClass {
        match intent {
            ThreadIntent::Worker => QoSClass::Utility,
            ThreadIntent::LatencySensitive => QoSClass::UserInitiated,
        }
    }
}

// FIXME: Windows has QoS APIs, we should use them!
#[cfg(not(target_vendor = "apple"))]
mod imp {
    use super::ThreadIntent;

    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
    pub(super) enum QoSClass {
        Default,
    }

    pub(super) const IS_QOS_AVAILABLE: bool = false;

    pub(super) fn set_current_thread_qos_class(_: QoSClass) {}

    pub(super) fn get_current_thread_qos_class() -> Option<QoSClass> {
        None
    }

    pub(super) fn thread_intent_to_qos_class(_: ThreadIntent) -> QoSClass {
        QoSClass::Default
    }
}
```

可以看到只有 Apple 平台才有 QoS 的具体实现, 其他平台都是空实现

这个 thread intent 的设计自从 `74bc2a47` 这个23年的提交后就没动过了, 我理解是这个功能没什么优先级吧

比如linux有nice之类的, 为什么不用? 或许可以调研一下 TODO
