---
title: 两种rust多线程方式的示例程序
date: 2025-01-23 00:49:51
tags: rust
--- 
```rust
fn get_primes_using_sharing_state(
    start: i32,
    end: i32,
    numbers_of_threads: i32,
    verbose: bool,
) -> Vec<i32> {
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

    let all_primes = Arc::new(Mutex::new(vec![]));

    let mut start_of_remain = start;
    let numbers_of_each_range = (end - start) / numbers_of_threads + 1;

    let mut handles = vec![];
    for index in 1..numbers_of_threads {
        let range_start = start_of_remain;
        let range_end = if range_start + numbers_of_each_range > end {
            end
        } else {
            start_of_remain + numbers_of_each_range
        };

        let primes_clone = all_primes.clone();
        let handle = thread::spawn(move || {
            let primes = calculate_mission(&range_start, &range_end);

            if verbose {
                println!("使用共享状态由线程 {index:2} 计算,数字{primes:?}是质数");
            }
            primes_clone.lock().unwrap().extend(primes);
        });
        handles.push(handle);
        start_of_remain = range_end;
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let result = all_primes.lock().unwrap().clone();
    result
}
```