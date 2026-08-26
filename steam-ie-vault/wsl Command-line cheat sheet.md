---
title: "Command-line cheat sheet"
source: "https://ubuntu.com/server/docs/reference/cli-cheatsheet/"
author:
published:
created: 2026-08-25
description: "Quick reference sheet for common Ubuntu command-line commands."
tags:
  - "clippings"
---
This page lists the most common commands in the Ubuntu command line. For full details on any command, run `man <command>` in your terminal.

## CLI basics

More detailed explanation of the commands in this section can be found in our [Welcome to the terminal](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/#welcome-to-the-terminal) tutorial.

### Working with the filesystem

| Command | Description | Online manual page |
| --- | --- | --- |
| `mkdir <name>` | Create a new directory | *[mkdir(1)](https://manpages.ubuntu.com/manpages/resolute/man1/mkdir.1.html)* |
| `rmdir <name>` | Remove an empty directory | *[rmdir(1)](https://manpages.ubuntu.com/manpages/resolute/man1/rmdir.1.html)* |
| `tree` | Display directory structure as a tree | *[tree(1)](https://manpages.ubuntu.com/manpages/resolute/man1/tree.1.html)* |
| `tree -L <n> <path>` | Display tree to depth `n` |  |

### Working with files

| Command | Description | Online manual page |
| --- | --- | --- |
| `touch <file>` | Create a new (empty) file, or update the timestamp of an existing file | *[touch(1)](https://manpages.ubuntu.com/manpages/resolute/man1/touch.1.html)* |
| `cp <src> <dest>` | Copy a file from a source (`src`) to a new destination (`dest`) | *[cp(1)](https://manpages.ubuntu.com/manpages/resolute/man1/cp.1.html)* |
| `cp -a <src> <dest>` | Copy a directory recursively, preserving permissions |  |
| `mv <src> <dest>` | Rename a file or directory | *[mv(1)](https://manpages.ubuntu.com/manpages/resolute/man1/mv.1.html)* |
| `mv <src>/file <dest>/file` | Move a file without renaming it |  |
| `rm <file>` | Remove a file | *[rm(1)](https://manpages.ubuntu.com/manpages/resolute/man1/rm.1.html)* |
| `rm -r <dir>` | Remove a non-empty directory and all its contents |  |
| `cat <file>` | Print the contents of `<file>` to the screen | *[cat(1)](https://manpages.ubuntu.com/manpages/resolute/man1/cat.1.html)* |
| `less <file>` | View file contents one page at a time | *[less(1)](https://manpages.ubuntu.com/manpages/resolute/man1/less.1.html)* |
| `head -n 20 <file>` | Print the first 20 lines of a file (default with no flag is 10) | *[head(1)](https://manpages.ubuntu.com/manpages/resolute/man1/head.1.html)* |
| `tail -n 20 <file>` | Print the last 20 lines of a file (default with no flag is 10) | *[tail(1)](https://manpages.ubuntu.com/manpages/resolute/man1/tail.1.html)* |
| `wc -l <file>` | Count the number of lines in a file | *[wc(1)](https://manpages.ubuntu.com/manpages/resolute/man1/wc.1.html)* |

### Users, groups, and permissions

| Command | Description | Online manual page |
| --- | --- | --- |
| `chmod <mode> <file>` | Change file permissions (symbolic or numeric notation) | *[chmod(1)](https://manpages.ubuntu.com/manpages/resolute/man1/chmod.1.html)* |
| `chown <user>:<group> <file>` | Change file owner and group | *[chown(1)](https://manpages.ubuntu.com/manpages/resolute/man1/chown.1.html)* |
| `umask` | Show or set the default permissions mask | *[umask(2)](https://manpages.ubuntu.com/manpages/resolute/man2/umask.2.html)* |
| `sudo <command>` | Run a command with administrator privileges | *[sudo(8)](https://manpages.ubuntu.com/manpages/resolute/man8/sudo-rs.8.html)* |

### Searching

| Command | Description | Online manual page |
| --- | --- | --- |
| `grep <pattern> <file>` | Search for lines matching a pattern in a file | *[grep(1)](https://manpages.ubuntu.com/manpages/resolute/man1/grep.1.html)* |
| `grep <name> /etc/passwd` | Look up a user account |  |
| `grep <name> /etc/group` | Look up group membership |  |
| `find <path> -name <pattern>` | Search for files matching a name pattern | *[find(1)](https://manpages.ubuntu.com/manpages/resolute/man1/find.1.html)* |
| `which <command>` | Show the full path to an executable command | *[which(1)](https://manpages.ubuntu.com/manpages/resolute/man1/which.debianutils.1.html)* |
| `file <name>` | Determine the type of a file | *[file(1)](https://manpages.ubuntu.com/manpages/resolute/man1/file.1.html)* |

## CLI in depth

More detailed explanation of the commands and operators in this section can be found in our [The command line in depth](https://ubuntu.com/server/docs/tutorial/cli-in-depth/#cli-in-depth) tutorial.

### Redirecting input and output

| Command | Description |
| --- | --- |
| `cmd > file` | Redirect stdout (1) to a file (overwrites existing content) |
| `cmd >> file` | Append stdout (1) to the end of `<file>` (does not overwrite existing contents) |
| `cmd < file` | Pass a file’s contents as stdin (0) to a command (`cmd`) |
| `cmd > /dev/null` | Discard stdout (1) entirely |
| `cmd 2> file` | Redirect stderr (2) to a file |
| `cmd > file 2>&1` | Redirect both stdout (1) and stderr (2) to a file |
| `cmd << EOF` | Here-document: feed multi-line text as stdin, ended by a line containing `EOF` |

## Pipes and command chaining

| Command | Description |
| --- | --- |
| `cmd1 \| cmd2` | Pipe stdout (1) of `cmd1` to stdin (0) of `cmd2` |
| `cmd1; cmd2` | Run commands in sequence regardless of exit status |
| `cmd1 && cmd2` | Run `cmd2` only if `cmd1` succeeds (exit code 0) |
| `cmd1 \|\| cmd2` | Run `cmd2` only if `cmd1` fails (non-zero exit code) |
| `cmd &` | Run a command in the background |
| `{ cmd1; cmd2; } > file` | Group commands and redirect their combined output |
| `(cmd1; cmd2)` | Run commands in a subshell (side effects don’t affect the current shell) |
| `cmd1 \` | Continue a long command on the next line |

## Variables and environment

| Command | Description | Online manual page |
| --- | --- | --- |
| `env` | List all environment variables | *[env(1)](https://manpages.ubuntu.com/manpages/resolute/man1/env.1.html)* |
| `echo $VAR` | Print the value of variable `VAR` | See note below this table |
| `VAR=value` | Set a shell variable (available in current shell only) |  |
| `export VAR=value` | Set a variable and export it to child processes |  |
| `unset VAR` | Remove a variable |  |
| `echo $?` | Print the exit status of the last command (`0` = success) |  |
| `echo $$` | Print the PID of the current shell |  |

> [!note] Note
> If you are using the bash, dash or zsh shell, `echo` is a builtin command documented under the shell manual page. For example, the [bash builtin shell section](https://manpages.ubuntu.com/manpages/resolute/man1/bash.1.html#shell-builtin-commands). If your shell doesn’t have an `echo` builtin command, use the *[echo(1)](https://manpages.ubuntu.com/manpages/resolute/man1/echo.1.html)* manual page instead.

## Shell expansion

| Command | Description |
| --- | --- |
| `~` | Expands to the home directory (`$HOME`) |
| `$VAR`, `${VAR}` | Variable expansion: replaced by the value of `VAR` |
| `$(command)` | Command substitution: replaced by the output of `command` |
| `$((expr))` | Arithmetic expansion: evaluates integer arithmetic, e.g. `$((5 + 3))` evaluates to `8` |
| `{a,b,c}` | Brace expansion: generates separate words, e.g. `{a,b,c}` → `a b c` |
| `{1..10}` | Range expansion: generates a sequence, e.g. `{1..5}` → `1 2 3 4 5` |
| `*` | Glob: matches any sequence of characters in a filename |
| `?` | Glob: matches any single character in a filename |
| `[abc]` | Glob: matches any one of the listed characters in a filename |

## Getting help

| Command | Description | Online manual page |
| --- | --- | --- |
| `man <command>` | Open the manual page for a command |  |
| `man man` | Open the manual page for `man` itself | *[man(1)](https://manpages.ubuntu.com/manpages/resolute/man1/man.1.html)* |
| `man -k <keyword>` | Search man page descriptions for a keyword |  |
| `<command> --help` | Print a brief help summary for a command |  |