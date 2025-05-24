---
title: rust中一个容易忘记的if_let中变量生命周期问题
date: 2025-05-24 16:39:10
tags:
---


## 引言

最近在使用rust编写代码时遇到了一个一开始没想明白的生命周期错误,大致如下:
```rust
fn get_playlist_cover(& mut self, id: u64) -> Option<& StatefulProtocol> {
        if let Some(image) = self.playlist_cover.get(&id) {
            return Some(image);
        }

        let image_type = ImageCacheType::PlaylistCover;

        if let Some(image) = self.try_load_image_from_disk(image_type, id) {
            self.playlist_cover.insert(id, image);
            return self.playlist_cover.get(&id);
        }

        None
    }
```

错误是
```rust
error[E0502]: cannot borrow *self as mutable because it is also borrowed as immutable
   --> src/app.rs:115:23
    |
108 |     pub(crate) fn get_playlist_cover(&mut self, id: u64) -> Option<&StatefulProtocol> {
    |                                      - let's call the lifetime of this reference '1
109 |         let existing_cache = self.playlist_cover.get(&id);
    |                              ------------------- immutable borrow occurs here
...
112 |             Some(image) => Some(image),
    |                            ----------- returning this value requires that self.playlist_cover is borrowed for '1
...
115 |                 match self.try_load_image_from_disk(image_type, id) {
    |                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ mutable borrow occurs here
```
问GPT,回答是在第一行借用self.playlist_cover.get(&id) 的时候将 `borrow` `immutable`,并且**生命周期持续到了函数结束**

我想的是if let语句都结束了,内部都返回了,为什么这个借用的生命周期还会持续呢?

查询一些资料后才发现, 其实还是rust基础有忘记的地方...


## 示例

```rust
#[derive(Debug)]
enum Pick {
    A,
    B,
}

fn if_let() {
    let expr = Pick::A;
    let temp = &mut expr;
    if let pat = temp {
        *pat = Pick::B;
        println!("{:?}", pat);
    }
    // 此处借用 expr 的不可变引用
    let d = &expr; // ❌ 错误：无法在存在可变借用的情况下再借用不可变引用
    println!("{:}", d);
}

fn _match() {
    let expr = Pick::A;
    let temp = &mut expr;
    match temp {
        pat => {
            *pat = Pick::B;
            println!("{:?}", pat);
        }
        _ => {
            // other code
            let d = &expr; // ❌ 同样错误
            println!("{:}", d);
        }
    }
}
```


## 错误解释

在以上两个函数中，Rust 编译器报错信息大致如下：

```
error[E0502]: cannot borrow `expr` as immutable because it is also borrowed as mutable
```

### 原因

这两个函数可以大致看为在生命周期上等价

Rust 的借用规则规定：

- 在作用域中同一时间**只能存在一个可变引用**，或任意多个不可变引用；
- 可变引用的生命周期必须完整地退出，之后才能出现新的引用（无论可变还是不可变）；

在本例中，`temp = &mut expr` 为 `expr` 创建了一个可变引用。此引用的生命周期在 `if let` 或 `match` 的整个匹配体中都被认为是有效的，即直到其作用域结束。

即便代码逻辑上你已经不再使用 `temp`，Rust 的借用检查器无法判断这一点，它只看作用域是否已退出，因此当你再尝试 `let d = &expr` 时，违反了借用规则。


## if let 与 match 

### `if let`

在 `if let pat = expr { ... }` 中，整个 `if let` 表达式会创建一个作用域块。

```rust
if let pat = expr {
    // 这个块内 pat 有效
}
// 这个块外 pat 不存在，但 borrow checker 仍认为 temp 的借用持续到了这里
```

由于 `if let` 没有分支匹配失败处理，所以匹配表达式本身的生命周期（包括其可变引用）会延伸到整个 `if let` 结束为止。

---

### `match`

虽然语义更完整，`match` 也一样遵循作用域原则。以下代码：

```rust
match temp {
    pat => {
        *pat = Pick::B;
    }
    _ => {
        let d = &expr;
    }
}
```

Rust 认为 `temp` 的借用在整个 `match` 表达式期间都处于活动状态，直到整个 `match` 块结束。

---

## 关键知识点总结

1. **借用规则**：
   - 同时只能有一个可变借用，或多个不可变借用。
   - 可变借用必须在作用域结束后才可进行不可变借用。

2. **作用域分析**：
   - `if let` 和 `match` 都会创建块作用域。
   - 绑定（如 `pat`）的生命周期由匹配表达式决定，而非代码逻辑上看起来的使用范围。

3. **编译器行为**：
   - Rust 编译器的借用检查器是保守的，通常不会分析变量是否仍被实际使用，而是依据作用域边界判断借用是否仍有效。

---

## 推荐做法

- 如果需要在匹配后继续使用原始变量，**手动控制作用域**：
  
```rust
let expr = Pick::A;
{
    let temp = &mut expr;
    if let pat = temp {
        *pat = Pick::B;
    }
}
// temp 的借用已经结束
let d = &expr;
```

- 避免将可变借用延伸到函数较长生命周期中，**尽量缩小作用域**。

## 上文代码解决方案
```rust
fn get_playlist_cover(&mut self, id: u64) -> Option<&mut StatefulProtocol> {
    // 尝试获取缓存（短生命周期）
    if self.playlist_cover.contains_key(&id) {
        return self.playlist_cover.get_mut(&id);
    }

    let image_type = ImageCacheType::PlaylistCover;

    self.try_load_image_from_disk(image_type, id)
        .map(|image| self.playlist_cover.entry(id).or_insert(image))
}
```

因为我要做的只是在函数一开始检查缓存中是否存在这个键而已, 在检查的阶段根本不需要对`self`借用, 只需要得到一个bool而已.