---
title: 一个仅依赖系统调用的sleep
date: 2026-01-02 18:32:13
tags:
---

这是一个**完全不依赖标准库**的 `sleep`命令，仅依赖 Linux x86_64 的系统调用

## 代码

```c
#define SYS_exit 60
#define SYS_write 1
#define SYS_nanosleep 35

long syscall1(long number, long arg1) {
    long result;
    __asm__ __volatile__("syscall"
                         : "=a"(result)
                         : "a"(number), "D"(arg1)
                         : "rcx", "r11", "memory");
    return result;
}
long syscall3(long number, long arg1, long arg2, long arg3) {
    long result;
    __asm__ __volatile__("syscall"
                         : "=a"(result)
                         : "a"(number), "D"(arg1), "S"(arg2), "d"(arg3)
                         : "rcx", "r11", "memory");
    return result;
}

struct timespec {
    long tv_sec;
    long tv_nsec;
};
int parse_int(char *raw) {
    int result = 0;

    char *cursor = raw;

    while (*cursor >= '0' && *cursor <= '9') {
        result = result * 10 + (*cursor - '0');
        cursor++;
    }

    return result;
}

long unsigned strlength(char *string) {
    char *cursor = string;
    while (*cursor != '\0') {
        cursor++;
    }

    long unsigned result = cursor - string;
    return result;
}

void print(char *string) {
    syscall3(SYS_write, 1, (long)string, strlength(string));
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        print("Usage: sleep number <seconds>\n");
        return 1;
    }

    char *raw_seconds = argv[1];
    int seconds = parse_int(raw_seconds);

    print("Sleeping...\n");
    struct timespec req;
    req.tv_sec = seconds;
    req.tv_nsec = 0;
    syscall3(SYS_nanosleep, (long)&req, 0, 0);

    return 0;
}

__attribute__((noreturn)) static void sys_exit(long code) {
    syscall1(SYS_exit, code);
    __builtin_unreachable();
}

// Stack protector stubs for -nostdlib builds.
unsigned long __stack_chk_guard = 0x595e9fbd94fda766ULL;
__attribute__((noreturn)) void __stack_chk_fail(void) {
    sys_exit(127);
}

__attribute__((naked)) void _start() {
    __asm__ __volatile__("xor %ebp, %ebp\n"
                         "mov (%rsp), %rdi\n"
                         "lea 8(%rsp), %rsi\n"
                         "and $-16,%rsp\n"
                         "call main\n"
                         "mov %rax, %rdi\n"
                         "call sys_exit\n");
}
```

## 系统调用包装

- `syscall1` / `syscall3`：用内联汇编触发 `syscall` 指令。
- 通过约定寄存器传参：`rax`=调用号，`rdi/rsi/rdx`=前三个参数。
- 返回值同样从 `rax` 取回，这与 Linux x86_64 ABI 一致。

## 自己实现的“小工具”

- `parse_int`：从字符串中逐位解析十进制，遇到非数字停止。
- `strlength`：手写字符串长度，避免 `strlen` 依赖。
- `print`：调用 `SYS_write`，向 `stdout(1)` 写字符串。

## nanosleep 的核心

- `struct timespec` 是 `nanosleep` 需要的参数：秒 + 纳秒。
- `req.tv_sec = seconds; req.tv_nsec = 0;` 代表纯秒级睡眠。
- `syscall3(SYS_nanosleep, &req, 0, 0)` 直接进入内核休眠。

## 程序入口与退出

- `main` 仅做参数检查、解析与调用 `nanosleep`。
- `sys_exit` 通过 `SYS_exit` 直接退出进程，绕开 libc。
- `_start` 是程序真实入口：手动取出 `argc/argv`，对齐栈后调用 `main`，再把返回值交给 `sys_exit`。

## 栈保护桩

- `__stack_chk_guard` / `__stack_chk_fail` 是 GCC 在启用栈保护时需要的符号。
- 这里提供最小实现，避免链接标准库；触发后直接 `exit(127)`。

## 编译

```
gcc sleep.c -o sleep -nostdlib
```

## 运行

```
./sleep 2
```
