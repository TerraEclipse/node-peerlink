peerlink
========

Offers `npm link` functionaltiy for developing with peerDependencies.

Install
-------

```
$ npm install -g peerlink
```

Usage
-----

Using `peerlink` is typically a three-step process.

First, you'll need to **start the peerlink daemon**. This daemon tracks any linked
folders you've set up and does the work of keeping everything in sync.

```
$ peerlink-daemon
```

Next, in the root of some module you want to link, **setup the link**. This adds
the module to the daemon's watch-list.

```
$ cd [root of your module]
$ peerlink
```

Finally, in the location where you want to sync the linked module, **link the
module**. This tells the daemon that you want to maintain a synced version of
the named module here.

```
$ cd [development directory]
$ peerlink [module-name]
```

Now, when you make changes in the linked directory, the peerlink daemon will
copy them into `node_modules/[module-name]`.

Configuration
--------------

By default, `peerlink` will save configuration in `~/.peerlink.json`.
An alternative to using the `peerlink` cli to setup links is to edit this file
directly.


- - -

### Developed by [TerraEclipse](https://github.com/TerraEclipse)

Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Santa Cruz, CA and Washington, D.C.

- - -

### License: MIT
Copyright (C) 2013 Terra Eclipse, Inc. ([http://www.terraeclipse.com](http://www.terraeclipse.com))

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
