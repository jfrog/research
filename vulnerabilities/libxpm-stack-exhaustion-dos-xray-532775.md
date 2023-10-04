---
description: CVE-2023-43786 Medium severity. libX11 & libXpm Stack Exhaustion DoS
title: libX11 & libXpm Stack Exhaustion DoS
date_published: "2023-10-04"
last_updated: "2023-10-04"
xray_id: XRAY-532775
vul_id: CVE-2023-43786
cvss: 4.7
severity: medium
discovered_by: Yair Mizrahi
type: vulnerability
---
## Summary
A stack exhaustion caused by an infinite recursion in libX11 and libXpm may lead to denial of service when parsing malicious image files.

## Component
libx11
libxpm

## Affected versions
(,1.8.7)
(,3.5.17)

## Description
The `PutSubImage()` function in libX11 did not calculate properly the termination condition for recursion when creating a new image, resulting in an endless recursive process.
As part of the bug report, a proof-of-concept demonstrating denial of service was included.

The PoC leveraged the bug in libXpm code during the parsing of Pixmap images to trigger the vulnerability in libX11.
This vulnerability can be exploited through various means, including the `sxpm` command-line tool provided by libXpm for displaying Pixmap images on the screen, as well as any application that utilizes the vulnerable functions (for example, `XpmReadFileToPixmap`) within libXpm to parse Pixmap images.

## PoC

An example for a vulnerable Xpm code snippet:
```c
#include <stdio.h>

#include <X11/Xlib.h>
#include <X11/Xutil.h>

main()
{
	Display *display;
	Pixmap *pixmap, *shape;
	Window window, rootwindow;
	int width, height, screen;
	char* xpmfile = "file.xpm";

	display = XOpenDisplay (NULL);
	screen = DefaultScreen (display);
	width = DisplayWidth (display, screen);
	height = DisplayHeight (display, screen);
	rootwindow = RootWindow (display, screen);

	window = XCreateSimpleWindow (display, rootwindow, 0, 0, width, height, 0, 0, 0);
	XpmReadFileToPixmap (display, window, xpmfile, &pixmap, &shape, NULL);
}
```

## Vulnerability Mitigations
No mitigations are supplied for this issue

## References
[Advisory](https://lists.x.org/archives/xorg-announce/2023-October/003424.html)
