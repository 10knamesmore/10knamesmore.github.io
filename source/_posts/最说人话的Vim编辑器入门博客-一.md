---
title: 最说人话的Vim编辑器入门博客(一)
date: 2024-08-28 20:52:09
tags: 
  - vim
  - 教程
---
***这是一个面向几乎零基础(像我刚学那样)人群的博客,所以会有点啰嗦***
***写下来的东西都是我在学习过程中想到的,希望也能分享出来***

相信你经常刷到,网络上很多言论如

> "vim就是世界上最牛逼的编辑器"
>
> "vim配置好能提高xx倍效率"
>
> "没学过vim不配成为程序员"

就算你不是个geek,肯定多少都会好奇,这些老毕登说的上古神器vim到底是个什么东西.😡

也有很多人第一次打开vim,按半天键盘先是发现屏幕上什么都没有.

不知道按了什么键后可以输入了,却不知道该怎么退出.😢

因为vim是个运行在终端上的程序,结果只能通过退出终端来关闭vim,结果最后文件也没保存下来. 😇

关于vim的诞生故事我就不讲了,B站上有很多讲的很好的视频.

我想说的是,在现在这个时代还使用vim的原因无非以下几种:

1. **轻量**,不像vscode等于运行个浏览器
2. **便捷,快速**,手不离开键盘
3. **扩展性**极强,可以随意更改配置,可以自己编写脚本

我感觉应该很少人会在意第一点,我甚至一直以来都是用vscode的vim插件. 😐

不过原生vim和vscode(包括一些其他IDE)的配置方式不太一样,这点以后再说

---

## 下载

vim在windows上我没怎么用过,所以整篇教程都用linux为例.

一般的发行版下载的镜像都自带Vim,如果真没有,一般也都可以用自带的包管理器下载.

打开终端输入:

- Debian/Ubuntu:

```bash
sudo apt update 
sudo apt install vim
```

- Fedora:

```bash
sudo dnf install vim
```

- CentOS/RHEL:

```bash
sudo yum install vim
```

- Arch Linux:

```bash
sudo pacman -S vim
```

下载完成后输入下面查看vim是否安装成功

```bash
vim --version
```

要是出了这些东西就是安装成功了

```bash
VIM - Vi IMproved 8.1 (2018 May 18, 编译于 May 03 2024 02:36:35)
包含补丁: 1-213, 1840, 214-579, 1969, 580-1848, 4975, 5023, 2110, 1849-1854, 1857, 1855-1857, 1331, 1858, 1858-1859, 1873, 1860-1969, 1992, 1970-1992, 2010, 1993-2068, 2106, 2069-2106, 2108, 2107-2109, 2109-2111, 2111-2112, 2112-2269, 3612, 3625, 3669, 3741, 1847
修改者 team+vim@tracker.debian.org
编译者 team+vim@tracker.debian.org
巨型版本 无图形界面。  可使用(+)与不可使用(-)的功能:
+acl               -farsi             -mouse_sysmouse    -tag_any_white
+arabic            +file_in_path      +mouse_urxvt       -tcl
+autocmd           +find_in_path      +mouse_xterm       +termguicolors
+autochdir         +float             +multi_byte        +terminal
-autoservername    +folding           +multi_lang        +terminfo
-balloon_eval      -footer            -mzscheme          +termresponse
......
```

你弹出来的东西有可能和我有些细节不同,vim不同版本有些小功能差异(比如我的版本不能使用系统剪切板).

但对于学习这个软件,基本的操作都相同.

---

## Hello vim!

在终端中输入

```bash
vim
```

可以在当前页面打开vim, 界面应该是这样的,(<_>表示光标的位置)

```bash
1   <_>
~                                                                             
~                                                                             
~                                                                             
~                                                                             
~                              VIM - Vi IMproved                              
~                                                                             
~                                版本 8.1.1847                                
~                           维护人 Bram Moolenaar 等                          
~                      修改者 team+vim@tracker.debian.org                     
~                       Vim 是可自由分发的开放源代码软件                      
~                                                                             
~                            帮助乌干达的可怜儿童！                           
~                输入  :help iccf<Enter>       查看说明                       
~                                                                             
~                输入  :q<Enter>               退出                           
~                输入  :help<Enter>  或  <F1>  查看在线帮助                   
~                输入  :help version8<Enter>   查看版本信息                   
~                                                                             
~                                                                             
~                                                                             
~                                                                             
~                                                                             
                                                              0,0-1        全部
```

你的界面可能是英文的,也没有左边的行号,不过这些不影响本篇文章的内容,以后都可以更改.

`~`表示占位符,即这个文件在这里没有内容.

你可以根据上面提示查看自带的命令,按下 `Shift`和 `;`输入 `:`进入***命令模式***.

此时你会看到你的光标到了左下角,也就是像这样

```bash
... ...
~
~
~
:<_>
```

因为vim中最后一行是不显示文件内容的,专门作为状态栏,显示当前模式,光标位置,文件权限等(可以通过插件配置).

再输入 `help`就可以看到他的官方教程了

```bash
help.txt*      For Vim version 8.1.  Last change: 2019 Jul 21

                        VIM - main help file
                                                                         k
      Move around:  Use the cursor keys, or "h" to go left,            h   l
                    "j" to go down, "k" to go up, "l" to go right.       j
Close this window:  Use ":q<Enter>".
   Get out of Vim:  Use ":qa!<Enter>" (careful, all changes are lost!).

Jump to a subject:  Position the cursor on a tag (e.g. |bars|) and hit CTRL-].
   With the mouse:  ":set mouse=a" to enable the mouse (in xterm or GUI).
                    Double-click the left mouse button on a tag, e.g. |bars|.
        Jump back:  Type CTRL-O.  Repeat to go further back.

Get specific help:  It is possible to go directly to whatever you want help
                    on, by giving an argument to the |:help| command.
                    Prepend something to specify the context:  *help-context*

                          WHAT                  PREPEND    EXAMPLE      ~
                      Normal mode command                  :help x
help.txt [帮助][只读]                                         1,1           顶端
1   hellovim
[未命名] [+]                                                  1,4           全部
记录中 @j
```

不过可能教程是英文,读起可能会有点障碍.

不过最好记住右上角 `hjkl`这四个字母的位置,这是默认的移动光标的按键,形成图像记忆有助于快速上手.

你可以先尝试在这个页面上用 `hjkl`移动光标浏览尝试下.

选择哪个教程看是你的自由.

如果你想退出,就像刚刚一样输入 `:q`,就可以返回到原本的文件编辑页面了.

你可能注意到我们刚刚都输入了冒号 `:`.

因为在***普通模式***(也就是一进入vim的默认模式)下,输入 `:`就会进入***命令模式***,可以在这个模式下输入各种指令

这个我们之后再说吧

现在我们在文件编辑页面:

```bash
1  
~                                                                             
~                                                                             
~                                                                             
... ...
```

按下 `a`进入***插入模式***,现在就像windows下的记事本一样,可以自由输入文本,也可以用方向键移动光标

左下角会提示当前模式

```bash
... ...
~                                                                             
~                                                                             
~                                                                             
-- 插入 --                                                    1,1          全部
```

输入 `Hello vim!`吧!😊

```bash
1   Hello vim<!_>
~                                                                             
~                                                                             
~                       
... ...
```

这个时候按 `Esc`键就可以退出***插入模式***,回到***普通模式***

也可以看到左下角的 `-- 插入 --`字样没了

这时候按 `Shift`和 `;`, 输入 `:`进入***命令模式***,按 `q`,即quit,表示退出vim

突然发现左下角有这样的提示😧

```bash
... ...
~                                                                             
~                                                                             
~                                                                             
E37: 已修改但尚未保存 (可用 ! 强制执行)                       1,12         全部
```

这是因为vim作为一个软件是运行在内存中的,它所有的修改,在没写入硬盘前都保存在这个进程的缓冲区中.

![](/2024/08/28/最说人话的Vim编辑器入门博客-一/vimprogress.png)

作为终端的子进程,如果没有写入硬盘就退出,vim占用的缓冲区内存也会释放,相当于都白写了!😨

不过你一定要不保存就退出的话也可以,就按照他的提示输入 `:q!`表示强制退出.

这时候vim不会将你的缓冲区写到硬盘中,而是直接退出.

要想正常地保存文件,先输入 `:w`,表示write,将缓冲区写到磁盘中.

输入一个空格 ,再写上你想将这个文件改为什么名字

整体上看就是这样 `:w hello.txt`

左下角会提示

```bash
... ...
~
~
~
"hello.txt" [新] 1L, 13C 已写入                               1,12         全部
```

再输入 `:q`就可以正常退出啦.😋

这时在终端中输入 `ls`就能看到我们刚刚创建的文件了

看一看里面有什么

```bash
wanger@wanger-16p:~$ cat hello.txt 
hello vim!
```

再用vim打开它看一下:

```bash
vim hello.txt
```

```bash
1   hello vim!
~
~
~
... ...
```

完全一致!

接下来可以尝试用vim开始写代码了

终端输入 `vim hellovim.c`

按 `a`进入***插入模式***,然后输入

```c
  1 #include<stdio.h>
  2 int main(){
  3        printf("hello vim!\n");
  4 }
```

这里注意,vim默认一个 `tab`表示输入8个空格,这个以后可以改.

如果需要移动光标的可以先展示用方向键代替,等学会用 `hjkl`后就会觉得,连方向键都是那么遥远,更别说鼠标了

输入 `:wq`退出到终端

输入 `gcc hellovim.c -o hello`编译生成可执行文件

输入 `./hello`运行

```bash
wanger@wanger-16p:~$ ./hello
hello vim!
```

成功!😍

---

OK这就是本篇文章的全部内容了,第一篇正经的技术博客,写完才感觉这么点东西为啥写这么多.

如果觉得太啰嗦,你管我😝
