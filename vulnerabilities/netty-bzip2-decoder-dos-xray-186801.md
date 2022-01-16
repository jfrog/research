---
title: netty Bzip2 decoder DoS
date_published: "2021-09-09"
last_updated: "2021-09-09"
xray_id: XRAY-186801
vul_id: CVE-2021-37136
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
Resource exhaustion in netty's Bzip2 decoder leads to denial of service

## Component

[Netty](https://github.com/netty/netty)

## Affected versions

[4.1.0 - 4.1.67], fixed in 4.1.68

## Description

[netty](https://github.com/netty/netty) is a popular client/server framework which enables quick and easy development of network applications such as protocol servers and clients.

A vulnerability was found in netty's Bzip2 decoder - when using the netty library and accepting arbitrary data streams to decode, netty does not limit the stream in any way.
An attacker that can submit a big file to decompress, may cause memory exhaustion which will lead to denial of service on the netty daemon process and possibly other processes on the same machine.

Example code that can trigger the issue -
```java
public static void main(String[] args) throws Exception {
Bzip2Decoder decoder = new Bzip2Decoder(); // Create the decompressor
final ByteBufAllocator allocator = new PooledByteBufAllocator(false);
FileInputStream file = new FileInputStream("C:\\temp\\100GB.bz2"); // External input
int inputChunks = 64 * 1024;
ByteBuf buf = allocator.heapBuffer(inputChunks);
ChannelHandlerContext ctx = new StubChannelHandlerContext(allocator);
while (buf.writeBytes(file, buf.writableBytes()) >= 0) {
System.out.println("Input: " + buf.capacity());
decoder.channelRead(ctx, buf); // BUG, No internal resource release!
buf = allocator.heapBuffer(inputChunks);
decoder.channelReadComplete(ctx);
}
```

## PoC

No PoC is supplied for this issue.

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue.

## References

[JFrog Blogpost](https://jfrog.com/blog/cve-2021-37136-cve-2021-37137-denial-of-service-dos-in-nettys-decompressors/)
