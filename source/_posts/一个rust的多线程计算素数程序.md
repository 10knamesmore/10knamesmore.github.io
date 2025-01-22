---
title: 一个rust的多线程计算素数程序
date: 2025-01-23 00:49:51
tags: rust

---
```rust
use core::time;
use std::{
    sync::mpsc::{self},
    thread::{self},
    time::SystemTime,
};

fn main() {
    for i in 1..30 {
        let before = SystemTime::now();
        let _ = get_primes(1, 1000000, i);

        let after = SystemTime::now();
        let running_time = after.duration_since(before).unwrap();
        println!("{i} 个线程用时 {running_time:?}");
    }
}

fn get_primes(start: i32, end: i32, numbers_of_threads: i32) -> Vec<i32> {
    let calculate_mission = |start: &i32, end: &i32| -> Vec<i32> {
        let mut res: Vec<i32> = vec![];
        if start == end {
            return res;
        }
        for num in *start..*end {
            if is_prime(&num) {
                res.push(num);
            }
        }
        res
    };

    let (tx, rx) = mpsc::channel();
    let mut start_of_remain = start;
    let numbers_of_each_range = (end - start) / numbers_of_threads + 1;

    for _ in 1..numbers_of_threads {
        let tx = tx.clone();
        let range_start = start_of_remain;
        let range_end = if range_start + numbers_of_each_range > end {
            end
        } else {
            start_of_remain + numbers_of_each_range
        };
        thread::spawn(move || {
            let primes = calculate_mission(&range_start, &range_end);
            tx.send(primes).unwrap();
        });
        start_of_remain = range_end;
    }

    drop(tx);

    let mut all_primes = vec![];
    for primes in rx {
        all_primes.extend(primes);
    }
    all_primes.sort();
    all_primes
}

fn is_prime(num: &i32) -> bool {
    if *num <= 1 {
        return false;
    }
    if *num == 2 {
        return true; // 2 是素数
    }
    if *num % 2 == 0 {
        return false; // 排除其他偶数
    }

    let limit = (*num as f64).sqrt() as i32; // 计算平方根
    for i in (3..=limit).step_by(2) {
        if *num % i == 0 {
            return false;
        }
    }
    true
}

#[test]
fn test() {
    let result = get_primes(10, 100, 10);
    // 10 到 100 的所有素数
    let expected = vec![
        11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
    ];
    assert_eq!(result, expected);
}
```