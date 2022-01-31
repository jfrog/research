(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{"1rDP":function(e,i,t){"use strict";t("h3Lo")},"2ogZ":function(e,i,t){},"9x/g":function(e,i,t){"use strict";t("DQNa");var a=t("vgRX"),r={name:"VulnerListItem",props:{vul:{type:Object,default:function(){return{path:"1",title:"2",description:"3",date_published:new Date,xray_id:"5",vul_id:"6",severity:"7",discovered_by:"8"}}}},computed:{severityColorVal:function(){var e=this.vul.severity;return Object(a.severityColor)(e)},dateString:function(){return Object(a.toBlogDateStr)(this.vul.date_published)}},methods:{goToVulURL:function(){var e="https://nvd.nist.gov/vuln/detail/".concat(this.vul.vul_id);window.open(e,"_blank").focus()},handleSingleVulItemClick:function(e){e.target.classList.contains("vul-id")?this.goToVulURL():this.$router.push({path:this.vul.path})}}},n=(t("LMZG"),t("KHd+")),s=Object(n.a)(r,(function(){var e=this,i=e.$createElement,t=e._self._c||i;return t("li",[t("div",{staticClass:"flex cursor-pointer flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-3 pb-4 mb-4 border-b-2 border-gray-400",on:{click:function(i){return e.handleSingleVulItemClick(i)}}},[t("div",{staticClass:"left"},[t("div",{staticClass:"xray-id text-sm"},[e._v(e._s(e.vul.xray_id))]),t("div",{staticClass:"details items-center mt-1 flex gap-2"},[t("span",{staticClass:"title font-bold"},[e._v(e._s(e.vul.title))]),t("span",{class:"badge hidden sm:block font-bold flex items-center justify-center bg-"+e.severityColorVal+" px-2 py-1 uppercase text-white"},[e._v(e._s(e.vul.severity))]),t("span",{staticClass:"vul-id hidden sm:block text-xs font-bold sm:hidden text-jfrog-green underline"},[e._v(e._s(e.vul.vul_id))])]),t("div",{staticClass:"vul-id text-xs font-bold mt-1 hidden sm:block text-jfrog-green underline"},[e._v("\n        "+e._s(e.vul.vul_id)+"\n      ")])]),t("div",{staticClass:"sm:hidden 123 flex gap-3 items-center"},[t("div",{staticClass:"vul-id text-xs font-bold mt-1 text-jfrog-green underline"},[e._v(e._s(e.vul.vul_id))]),t("span",{class:"badge font-bold flex items-center justify-center bg-"+e.severityColorVal+" px-2 py-1 uppercase text-white"},[e._v(e._s(e.vul.severity))])]),t("div",{staticClass:"right text-xs"},[t("div",{staticClass:"discovered-by flex gap-1 items-center sm:justify-end"},[t("span",{staticClass:"text"},[e._v("Discovered By")]),t("strong",[e._v(e._s(e.vul.discovered_by))]),t("span",{staticClass:"text-jfrog-green hidden sm:block"},[e._v("●")])]),t("div",{staticClass:"published-on flex gap-1 items-center sm:justify-end mt-2"},[t("span",{staticClass:"text"},[e._v("Published on")]),t("strong",[e._v(" "+e._s(e.dateString)+" ")]),t("span",{staticClass:"text-jfrog-green hidden sm:block"},[e._v("●")])])])])])}),[],!1,null,null,null);i.a=s.exports},DQNa:function(e,i,t){var a=t("busE"),r=Date.prototype,n=r.toString,s=r.getTime;new Date(NaN)+""!="Invalid Date"&&a(r,"toString",(function(){var e=s.call(this);return e==e?n.call(this):"Invalid Date"}))},FRA7:function(e,i,t){"use strict";t("2ogZ")},KQm4:function(e,i,t){"use strict";t.d(i,"a",(function(){return n}));var a=t("a3WO");var r=t("BsWD");function n(e){return function(e){if(Array.isArray(e))return Object(a.a)(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||Object(r.a)(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}},LMZG:function(e,i,t){"use strict";t("q+sK")},"NzC+":function(e,i,t){"use strict";t.r(i);var a=t("KQm4"),r=(t("DQNa"),t("07d7"),t("JfAA"),t("pDQq"),t("vgRX")),n=t("VrYi"),s=t("9x/g"),d={name:"Vulnerabilities",data:function(){return{title:"Software Vulnerabilities",bannerTitle:"Vulnerabilities <br> discovered",postsPerPage:10,currentPage:1,VulnerListItem:s.a}},computed:{latestPostDate:function(){var e=Object(a.a)(this.$static.posts.edges)[0].node.date_published;return Object(r.toBlogDateStr)(e)},postsChunks:function(){var e=Object(a.a)(this.$static.posts.edges),i=this.chunks(e,this.postsPerPage);return i},activeChunk:function(){var e=this.currentPage-1?this.currentPage-1:0;return this.postsChunks[e]},bannerNumber:function(){return this.$static.posts.edges.length.toString()}},components:{BannerSmall:n.a,VulnerListItem:s.a},mounted:function(){},methods:{chunks:function(e,i){for(var t=[];e.length;)t.push(e.splice(0,i));return t},getPaginationClass:function(e){var i="w-8 h-8 text-sm flex items-center justify-center hover:bg-jfrog-green hover:text-white transition-all";return e===this.currentPage?i+=" bg-jfrog-green text-white":i+=" bg-gray-300 text-black",i}},metaInfo:function(){return{title:"Software Vulnerabilities | JFrog Security Research",meta:[{name:"description",content:"Latest security vulnerabilities discovered. Our security researchers and engineers collaborate to create advanced vulnerability scanners to help the community"}],link:[{rel:"canonical",content:"https://research.jfrog.com/vulnerabilities/"}]}}},l=(t("FRA7"),t("KHd+")),o=t("Kw5r"),c=o.a.config.optionMergeStrategies.computed,u={posts:{edges:[{node:{id:"93258d692111621fda2f9f89211b3300",path:"/vulnerabilities/h2-console-jndi-rce-xray-193805/",title:"H2 console JNDI RCE",description:"CVE-2021-42392 Critical severity. Unsafe JNDI loading in H2 database console leads to remote code execution",date_published:"2022-01-06",xray_id:"XRAY-193805",vul_id:"CVE-2021-42392",severity:"critical",discovered_by:"Andrey Polkovnychenko",type:"vulnerability"}},{node:{id:"8b99725734b11d87e569a22ddfbd6c48",path:"/vulnerabilities/goahead-timing-attack-auth-bypass-xray-194044/",title:"GoAhead timing attack auth bypass",description:"CVE-2021-43298 Medium severity. A timing attack in GoAhead allows an attacker to perform authentication bypass on password-protected web pages",date_published:"2022-01-01",xray_id:"XRAY-194044",vul_id:"CVE-2021-43298",severity:"medium",discovered_by:"Omer Kaspi",type:"vulnerability"}},{node:{id:"49a3b4f24c697c28a8eba7de63429501",path:"/vulnerabilities/tensorflow-python-code-injection-xray-189178/",title:"TensorFlow Python code injection",description:"CVE-2021-41228 High severity. Insufficient input validation in TensorFlow allows an attacker to perform Python code injection when processing a malicious command line argument",date_published:"2021-11-16",xray_id:"XRAY-189178",vul_id:"CVE-2021-41228",severity:"high",discovered_by:"Omer Kaspi",type:"vulnerability"}},{node:{id:"36b01f9647a6457cef116c2fd3ce960b",path:"/vulnerabilities/busybox-man-null-pointer-dereference-xray-189471/",title:"BusyBox man NULL Pointer Dereference",description:"CVE-2021-42373 Medium severity. BusyBox man Section Name Handling NULL Pointer Dereference Local DoS",date_published:"2021-11-09",xray_id:"XRAY-189471",vul_id:"CVE-2021-42373",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"292ca08ee0a10a93f47896a18c1b51cd",path:"/vulnerabilities/busybox-lzma-oob-r-xray-189472/",title:"BusyBox LZMA OOB-R",description:"CVE-2021-42374 Medium severity. A OOB heap read in Busybox lzma leads to data leakage and denial of service when decompressing a malformed LZMA-based archive",date_published:"2021-11-09",xray_id:"XRAY-189472",vul_id:"CVE-2021-42374",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"4ebaf64b5de933cd18e3c30349bea5f3",path:"/vulnerabilities/busybox-hush-untrusted-free-xray-189474/",title:"BusyBox hush Untrusted Free",description:"CVE-2021-42377 Medium severity. An attacker-controlled pointer free in Busybox hush leads to remote code execution when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189474",vul_id:"CVE-2021-42377",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"dc8062dd358ecfcc5331d732c2f85968",path:"/vulnerabilities/busybox-hush-null-pointer-dereference-xray-189794/",title:"BusyBox hush NULL Pointer Dereference",description:"CVE-2021-42376 Medium severity. A NULL pointer dereference in Busybox hush leads to denial of service when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189794",vul_id:"CVE-2021-42376",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"290091d102f467c2ec38ff3b7c8dfefd",path:"/vulnerabilities/busybox-awk-getvar-s-uaf-xray-189479/",title:"BusyBox awk getvar_s UaF",description:"CVE-2021-42382 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189479",vul_id:"CVE-2021-42382",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"5ccf500ea748e99ccca707d55209e8c5",path:"/vulnerabilities/busybox-awk-nvalloc-uaf-xray-189483/",title:"BusyBox awk nvalloc UaF",description:"CVE-2021-42386 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189483",vul_id:"CVE-2021-42386",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"bfe36b6e3cd1502fb3b5ad13cf39cd3f",path:"/vulnerabilities/busybox-awk-next-input-file-uaf-xray-189476/",title:"BusyBox awk next_input_file UaF",description:"CVE-2021-42379 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189476",vul_id:"CVE-2021-42379",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"9ba9dad08bda3a46832a1db19e98a3b9",path:"/vulnerabilities/busybox-awk-hash-init-uaf-xray-189478/",title:"BusyBox awk hash_init UaF",description:"CVE-2021-42381 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189478",vul_id:"CVE-2021-42381",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"3ed1c7a151ce2a0cb13bcad356d6bc49",path:"/vulnerabilities/busybox-awk-handle-special-uaf-xray-189481/",title:"BusyBox awk handle_special UaF",description:"CVE-2021-42384 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189481",vul_id:"CVE-2021-42384",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"6ee8cd08b6fd1c56074638dc1e40607a",path:"/vulnerabilities/busybox-awk-evaluate-uaf-xray-189482/",title:"BusyBox awk evaluate UaF",description:"CVE-2021-42385 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189482",vul_id:"CVE-2021-42385",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"c4e8b0780f3c706209541fb2fd3ffb23",path:"/vulnerabilities/busybox-awk-clrvar-uaf-xray-189477/",title:"BusyBox awk clrvar UaF",description:"CVE-2021-42380 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189477",vul_id:"CVE-2021-42380",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"a35946506066319f8146b00b9087e164",path:"/vulnerabilities/busybox-awk-evaluate-uaf-xray-189480/",title:"BusyBox awk evaluate UaF",description:"CVE-2021-42383 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189480",vul_id:"CVE-2021-42383",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"591d34c4a6aa1a4aad20ddd716d49f63",path:"/vulnerabilities/busybox-ash-dos-xray-189473/",title:"BusyBox ash DoS",description:"CVE-2021-42375 Medium severity. An incorrect handling of a special element in Busybox ash leads to denial of service when processing malformed command line arguments",date_published:"2021-11-09",xray_id:"XRAY-189473",vul_id:"CVE-2021-42375",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"3c3827d5c90d1322ef28da180aaf1ab1",path:"/vulnerabilities/civetweb-file-upload-rce-xray-188861/",title:"CivetWeb file upload RCE",description:"CVE-2020-27304  critical severity. A path traversal in CivetWeb leads to remote code execution when an attacker uploads a maliciously-named file",date_published:"2021-10-19",xray_id:"XRAY-188861",vul_id:"CVE-2020-27304",severity:"critical",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"b0c8724ecf4c47b89c1cbc0f8e939643",path:"/vulnerabilities/busybox-awk-getvar-i-uaf-xray-189475/",title:"BusyBox awk getvar_i UaF",description:"CVE-2021-42378 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments",date_published:"2021-10-09",xray_id:"XRAY-189475",vul_id:"CVE-2021-42378",severity:"medium",discovered_by:"JFrog Collab",type:"vulnerability"}},{node:{id:"a7dd0abd8e775b9dc1e9941262657f12",path:"/vulnerabilities/yamale-schema-code-injection-xray-182135/",title:"Yamale schema code injection",description:"CVE-2021-38305 High severity. Insufficient input validation in Yamale allows an attacker to perform Python code injection when processing a malicious schema file",date_published:"2021-10-05",xray_id:"XRAY-182135",vul_id:"CVE-2021-38305",severity:"high",discovered_by:"Andrey Polkovnychenko",type:"vulnerability"}},{node:{id:"d243fa38806146ca8fac6c3c44da5667",path:"/vulnerabilities/netty-snappy-decoder-dos-xray-186810/",title:"netty Snappy decoder DoS",description:"CVE-2021-37137 High severity. Resource exhaustion in netty's Snappy decoder leads to denial of service.",date_published:"2021-09-09",xray_id:"XRAY-186810",vul_id:"CVE-2021-37137",severity:"high",discovered_by:"Ori Hollander",type:"vulnerability"}},{node:{id:"50453eadd4ce878e4ccddcc09e3eda0a",path:"/vulnerabilities/netty-bzip2-decoder-dos-xray-186801/",title:"netty Bzip2 decoder DoS",description:"CVE-2021-37136 High severity. Resource exhaustion in netty's Bzip2 decoder leads to denial of service",date_published:"2021-09-09",xray_id:"XRAY-186801",vul_id:"CVE-2021-37136",severity:"high",discovered_by:"Ori Hollander",type:"vulnerability"}},{node:{id:"264a0c145f59b861abbaa26f83017155",path:"/vulnerabilities/nichestack-unknown-http-panic-xray-194055/",title:"NicheStack unknown HTTP panic",description:"CVE-2020-27565 High severity. NicheStack unknown HTTP requests cause a panic",date_published:"2021-08-04",xray_id:"XRAY-194055",vul_id:"CVE-2020-27565",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"b749f0fae1b644f0ebc89c5d2fb8e606",path:"/vulnerabilities/nichestack-tftp-filename-oob-r-xray-194059/",title:"NicheStack TFTP filename OOB-R",description:"CVE-2021-36762 High severity. NicheStack TFTP filename read out of bounds",date_published:"2021-08-04",xray_id:"XRAY-194059",vul_id:"CVE-2021-36762",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"a586ea61be563aaf5cc71e6733579916",path:"/vulnerabilities/nichestack-tcp-urg-dos-xray-194050/",title:"NicheStack TCP URG DoS",description:"CVE-2021-31400 High severity. NicheStack TCP out-of-band urgent data processing DoS",date_published:"2021-08-04",xray_id:"XRAY-194050",vul_id:"CVE-2021-31400",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"496c6030051b1001cc093fc1609bb001",path:"/vulnerabilities/nichestack-tcp-isns-are-generated-in-a-predictable-manner-xray-194054/",title:"NicheStack TCP ISNs are generated in a predictable manner",description:"CVE-2020-35685 High severity. NicheStack TCP ISNs are generated in a predictable manner",date_published:"2021-08-04",xray_id:"XRAY-194054",vul_id:"CVE-2020-35685",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"9eaf51302807e9144e58d7b9066430f0",path:"/vulnerabilities/nichestack-ip-length-dos-xray-194051/",title:"NicheStack IP length DoS",description:"CVE-2021-31401 High severity. NicheStack TCP header IP length integer overflow leads to DoS",date_published:"2021-08-04",xray_id:"XRAY-194051",vul_id:"CVE-2021-31401",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"f429d52f641661948bac1d1cb4beff01",path:"/vulnerabilities/nichestack-icmp-payload-oob-r-xray-194053/",title:"NicheStack ICMP payload OOB-R",description:"CVE-2020-35684 High severity. NicheStack ICMP IP payload size read out of bounds",date_published:"2021-08-04",xray_id:"XRAY-194053",vul_id:"CVE-2020-35684",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"60ce5a9df134d82d0e8a4a8a912ae8ee",path:"/vulnerabilities/nichestack-icmp-payload-oob-r-xray-194052/",title:"NicheStack ICMP payload OOB-R",description:"CVE-2020-35683 High severity. NicheStack ICMP IP payload size read out of bounds",date_published:"2021-08-04",xray_id:"XRAY-194052",vul_id:"CVE-2020-35683",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"b836cb78e312afed872ab1208a4bac53",path:"/vulnerabilities/nichestack-http-server-dos-xray-194049/",title:"NicheStack HTTP server DoS",description:"CVE-2021-31227 High severity. A heap buffer overflow exists in NicheStack in the code that parses the HTTP POST request due to an incorrect signed integer comparison",date_published:"2021-08-04",xray_id:"XRAY-194049",vul_id:"CVE-2021-31227",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"7eb4ccca08433cc0672b8a7a71929640",path:"/vulnerabilities/nichestack-dns-client-txid-weak-random-xray-194057/",title:"NicheStack DNS client TXID weak random",description:"CVE-2020-25926 Medium severity. NicheStack DNS client does not set sufficiently random transaction IDs",date_published:"2021-08-04",xray_id:"XRAY-194057",vul_id:"CVE-2020-25926",severity:"medium",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"e6f34a75cbd04ede3dee29a5db3bf7e5",path:"/vulnerabilities/nichestack-dns-client-oob-r-xray-194048/",title:"NicheStack DNS client OOB-R",description:"CVE-2020-25927 High severity. NicheStack routine for parsing DNS responses does not check whether the number of queries/responses specified in the packet header corresponds to the query/response data available in the DNS packet, leading to OOB-R",date_published:"2021-08-04",xray_id:"XRAY-194048",vul_id:"CVE-2020-25927",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"e8e368aede6c599ddfc8ba7ebc1fec55",path:"/vulnerabilities/nichestack-dns-client-oob-r-xray-194047/",title:"NicheStack DNS client OOB-R",description:"CVE-2020-25767 High severity. The NicheStack routine for parsing DNS domain names does not check whether a compression pointer points within the bounds of a packet, which leads to OOB-R",date_published:"2021-08-04",xray_id:"XRAY-194047",vul_id:"CVE-2020-25767",severity:"high",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"fd1483576c18efad4961d46ca7a53197",path:"/vulnerabilities/nichestack-dns-client-does-not-set-sufficiently-random-source-ports-xray-194058/",title:"NicheStack DNS client does not set sufficiently random source ports",description:"CVE-2021-31228 Medium severity. NicheStack DNS client does not set sufficiently random source ports",date_published:"2021-08-04",xray_id:"XRAY-194058",vul_id:"CVE-2021-31228",severity:"medium",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"e74b909517056baca3c32fbe5bb087a8",path:"/vulnerabilities/interniche-http-server-heap-overflow-xray-194046/",title:"InterNiche HTTP server heap overflow",description:"CVE-2021-31226 Critical severity. Heap overflow in InterNiche TCP/IP stack's HTTP server leads to remote code execution when sending a crafted HTTP POST request",date_published:"2021-08-04",xray_id:"XRAY-194046",vul_id:"CVE-2021-31226",severity:"critical",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"418e87ec2ff091957a12078b4439d4ff",path:"/vulnerabilities/interniche-dns-client-heap-overflow-xray-194045/",title:"InterNiche DNS client heap overflow",description:"CVE-2020-25928 Critical severity. Heap overflow in InterNiche TCP/IP stack's DNS client leads to remote code execution when sending a crafted DNS response",date_published:"2021-08-04",xray_id:"XRAY-194045",vul_id:"CVE-2020-25928",severity:"critical",discovered_by:"Denys Vozniuk",type:"vulnerability"}},{node:{id:"77fed6c28efd5cac16c23873fda9d3e2",path:"/vulnerabilities/integer-overflow-in-haproxy-leads-to-http-smuggling-xray-184496/",title:"Integer overflow in HAProxy leads to HTTP Smuggling",description:"CVE-2021-40346 High severity. An integer overflow in HAProxy leads to HTTP Smuggling via simple network requests",date_published:"2021-07-09",xray_id:"XRAY-184496",vul_id:"CVE-2021-40346",severity:"high",discovered_by:"Ori Hollander",type:"vulnerability"}},{node:{id:"3b9de2178fc5fb2b900be2246e4e0eb0",path:"/vulnerabilities/realtek-8710-wpa2-stack-overflow-xray-194061/",title:"Realtek 8710 WPA2 stack overflow",description:"CVE-2020-27302 High severity. Stack overflow in Realtek 8710 WPA2 key parsing leads to remote code execution",date_published:"2021-06-02",xray_id:"XRAY-194061",vul_id:"CVE-2020-27302",severity:"high",discovered_by:"Uriya Yavnieli",type:"vulnerability"}},{node:{id:"d0aada54c9fe9cb23a6b89acac32f814",path:"/vulnerabilities/realtek-8710-wpa2-stack-overflow-xray-194060/",title:"Realtek 8710 WPA2 stack overflow",description:"CVE-2020-27301 High severity. Stack overflow in Realtek 8710 WPA2 key parsing leads to remote code execution",date_published:"2021-06-02",xray_id:"XRAY-194060",vul_id:"CVE-2020-27301",severity:"high",discovered_by:"Uriya Yavnieli",type:"vulnerability"}},{node:{id:"b8f56da6e5d5a650fbe70527f799e3ab",path:"/vulnerabilities/xss-in-nanohttpd-xray-141192/",title:"XSS in NanoHTTPD",description:"CVE-2020-13697 High severity. An attacker can run malicious JavaScript code due to an XSS in the *GeneralHandler* GET handler.",date_published:"2021-02-23",xray_id:"XRAY-141192",vul_id:"CVE-2020-13697",severity:"high",discovered_by:"Andrey Polkovnychenko",type:"vulnerability"}},{node:{id:"a65e95bc29c1395fff6fc5c2e6f60c44",path:"/vulnerabilities/realtek-rtl8195-a-rce-xray-194070/",title:"Realtek RTL8195A RCE",description:"CVE-2020-25853 High severity. A stack buffer over-read in the Realtek RTL8195A Wi-Fi Module allows unauthenticated attackers in wireless range to cause denial of service by impersonating a Wi-Fi access point",date_published:"2021-02-03",xray_id:"XRAY-194070",vul_id:"CVE-2020-25853",severity:"high",discovered_by:"Uriya Yavnieli",type:"vulnerability"}},{node:{id:"d7a0319db59e3440c4d35fff6a250ebd",path:"/vulnerabilities/realtek-rtl8195-a-rce-xray-194069/",title:"Realtek RTL8195A RCE",description:"CVE-2020-25854 High severity. A stack buffer overflow in the Realtek RTL8195A Wi-Fi Module allows authenticated attackers in wireless range to perform remote code execution by impersonating a Wi-Fi access point",date_published:"2021-02-03",xray_id:"XRAY-194069",vul_id:"CVE-2020-25854",severity:"high",discovered_by:"Uriya Yavnieli",type:"vulnerability"}},{node:{id:"9b780bdfff73a4781a6aafa122451915",path:"/vulnerabilities/realtek-rtl8195-a-rce-xray-194068/",title:"Realtek RTL8195A RCE",description:"CVE-2020-25855 High severity. A stack buffer overflow in the Realtek RTL8195A Wi-Fi Module allows authenticated attackers in wireless range to perform remote code execution by impersonating a Wi-Fi access point",date_published:"2021-02-03",xray_id:"XRAY-194068",vul_id:"CVE-2020-25855",severity:"high",discovered_by:"Uriya Yavnieli",type:"vulnerability"}},{node:{id:"b3428cfed1e7d774a961765e077ea501",path:"/vulnerabilities/realtek-rtl8195-a-rce-xray-194067/",title:"Realtek RTL8195A RCE",description:"CVE-2020-25856 High severity. A stack buffer overflow in the Realtek RTL8195A Wi-Fi Module allows authenticated attackers in wireless range to perform remote code execution by impersonating a Wi-Fi access point",date_published:"2021-02-03",xray_id:"XRAY-194067",vul_id:"CVE-2020-25856",severity:"high",discovered_by:"Uriya Yavnieli",type:"vulnerability"}},{node:{id:"f7ad5174c35341d351509f02f49230b1",path:"/vulnerabilities/realtek-rtl8195-a-dos-xray-194066/",title:"Realtek RTL8195A DoS",description:"CVE-2020-25857 High severity. A stack buffer overflow in the Realtek RTL8195A Wi-Fi Module allows unauthenticated attackers in wireless range to cause denial of service by impersonating a Wi-Fi access point",date_published:"2021-02-03",xray_id:"XRAY-194066",vul_id:"CVE-2020-25857",severity:"high",discovered_by:"Uriya Yavnieli",type:"vulnerability"}},{node:{id:"0696f1348e5fd33f64d12c86d9059830",path:"/vulnerabilities/realtek-multiple-wi-fi-modules-rce-xray-194071/",title:"Realtek multiple Wi-Fi modules RCE",description:"CVE-2020-9395 High severity. A stack buffer overflow in Realtek Wi-Fi modules allows attackers in wireless range to perform arbitrary code execution by impersonating a Wi-Fi access point",date_published:"2021-02-03",xray_id:"XRAY-194071",vul_id:"CVE-2020-9395",severity:"high",discovered_by:"Uriya Yavnieli",type:"vulnerability"}},{node:{id:"afb4a608d1dda8ad3e21597a14ac3355",path:"/vulnerabilities/pengutronix-rauc-signature-bypass-xray-194062/",title:"Pengutronix RAUC signature bypass",description:"CVE-2020-25860 Medium severity. ToCToU in Pengutronix RAUC allows attackers to bypass signature verification",date_published:"2020-12-21",xray_id:"XRAY-194062",vul_id:"CVE-2020-25860",severity:"medium",discovered_by:"Uriya Yavnieli",type:"vulnerability"}},{node:{id:"4c8ca4f240802ae8cc0fef0a149925ad",path:"/vulnerabilities/qcmap-web-interface-rce-xray-194063/",title:"QCMAP Web Interface RCE",description:"CVE-2020-3657 Critical severity. Command injection and stack overflow in the Qualcomm QCMAP Web Interface leads to remote code execution",date_published:"2020-10-14",xray_id:"XRAY-194063",vul_id:"CVE-2020-3657",severity:"critical",discovered_by:"Ori Hollander",type:"vulnerability"}},{node:{id:"7dd1f33acec725f349a708329119b53a",path:"/vulnerabilities/qcmap-web-interface-null-pointer-dereference-xray-194064/",title:"QCMAP Web Interface NULL pointer dereference",description:"CVE-2020-25858 High severity. A null pointer dereference in the QCMAP_Web_CLIENT binary in the Qualcomm QCMAP software suite allows authenticated network attackers to cause denial of service by sending a request with a crafted URL.",date_published:"2020-10-14",xray_id:"XRAY-194064",vul_id:"CVE-2020-25858",severity:"high",discovered_by:"Ori Hollander",type:"vulnerability"}},{node:{id:"024ccccff0461def7bbd5db8c52e56af",path:"/vulnerabilities/qcmap-cli-command-injection-xray-194065/",title:"QCMAP CLI command injection",description:"CVE-2020-25859 Medium severity. Insufficient input validation in the QCMAP_CLI utility in the Qualcomm QCMAP software suite allows authenticated unprivileged local attackers to perform arbitrary code execution by sending crafted CLI commands.",date_published:"2020-10-14",xray_id:"XRAY-194065",vul_id:"CVE-2020-25859",severity:"medium",discovered_by:"Ori Hollander",type:"vulnerability"}},{node:{id:"affa37adb5a40ea15e2c9f0fbce942db",path:"/vulnerabilities/qnx-slinger-path-traversal-rce-xray-194072/",title:"QNX slinger path traversal RCE",description:"CVE-2020-6932 Critical severity. Path traversal in the slinger web server on BlackBerry QNX allows unauthenticated network attackers to run arbitrary executables and read arbitrary files with the privileges of the web server by sending a simple crafted packet",date_published:"2020-08-12",xray_id:"XRAY-194072",vul_id:"CVE-2020-6932",severity:"critical",discovered_by:"Ilya Khivrich",type:"vulnerability"}},{node:{id:"4a4de6a8f345b4a28d26bff1af78459b",path:"/vulnerabilities/libmodbus-modbus-fc-write-multiple-registers-oob-r-xray-150046/",title:"libmodbus MODBUS_FC_WRITE_MULTIPLE_REGISTERS OOB-R",description:"CVE-2019-14463 Critical severity. Insufficient input validation in the libmodbus library allows unprivileged local network attackers to cause data leakage by sending simple crafted packets.",date_published:"2019-07-31",xray_id:"XRAY-150046",vul_id:"CVE-2019-14463",severity:"critical",discovered_by:"Maor Vermucht",type:"vulnerability"}},{node:{id:"5242aa341dad1faa61079fcd97206d34",path:"/vulnerabilities/libmodbus-modbus-fc-write-multiple-coils-oob-r-xray-150047/",title:"libmodbus MODBUS_FC_WRITE_MULTIPLE_COILS OOB-R",description:"CVE-2019-14462 Critical severity. Insufficient input validation in the libmodbus library allows unprivileged local network attackers to cause data leakage by sending simple crafted packets.",date_published:"2019-07-31",xray_id:"XRAY-150047",vul_id:"CVE-2019-14462",severity:"critical",discovered_by:"Maor Vermucht",type:"vulnerability"}},{node:{id:"e26bd804a045e7ba06910c6305edcc70",path:"/vulnerabilities/miniupnpd-upnp-event-prepare-infoleak-xray-148214/",title:"MiniUPnPd upnp_event_prepare infoleak",description:"CVE-2019-12107 High severity. Information leakage in MiniUPnPd due to improper validation of snprintf return value",date_published:"2019-02-06",xray_id:"XRAY-148214",vul_id:"CVE-2019-12107",severity:"high",discovered_by:"Ben Barnea",type:"vulnerability"}},{node:{id:"60dc99f26d4f449cb88a44b6974ac6ee",path:"/vulnerabilities/miniupnpd-getoutboundpinholetimeout-null-pointer-dereference-xray-148213/",title:"MiniUPnPd GetOutboundPinholeTimeout NULL pointer dereference",description:"CVE-2019-12108 High severity. Denial Of Service in MiniUPnPd due to a NULL pointer dereference in upnpsoap.c for int_port",date_published:"2019-02-06",xray_id:"XRAY-148213",vul_id:"CVE-2019-12108",severity:"high",discovered_by:"Ben Barnea",type:"vulnerability"}},{node:{id:"eb24b54b7b44dd20e6ffbc143ef1022f",path:"/vulnerabilities/miniupnpd-getoutboundpinholetimeout-null-pointer-dereference-xray-148212/",title:"MiniUPnPd GetOutboundPinholeTimeout NULL pointer dereference",description:"CVE-2019-12109 High severity. Denial Of Service in MiniUPnPd due to a NULL pointer dereference in upnpsoap.c for rem_port",date_published:"2019-02-06",xray_id:"XRAY-148212",vul_id:"CVE-2019-12109",severity:"high",discovered_by:"Ben Barnea",type:"vulnerability"}},{node:{id:"ce4d1474920dea66f4b9128d5a230a20",path:"/vulnerabilities/miniupnpd-copyipv6-ifdifferent-null-pointer-dereference-xray-162485/",title:"MiniUPnPd copyIPv6IfDifferent NULL pointer dereference",description:"CVE-2019-12111 High severity. Denial Of Service in MiniUPnPd due to a NULL pointer dereference in pcpserver.c",date_published:"2019-02-06",xray_id:"XRAY-162485",vul_id:"CVE-2019-12111",severity:"high",discovered_by:"Ben Barnea",type:"vulnerability"}},{node:{id:"eb948f39b66a81b642d2a91c5ca0fbe3",path:"/vulnerabilities/miniupnpd-addportmapping-null-pointer-dereference-xray-148211/",title:"MiniUPnPd AddPortMapping NULL pointer dereference",description:"CVE-2019-12110 High severity. Denial Of Service in MiniUPnPd due to a NULL pointer dereference in upnpredirect.c",date_published:"2019-02-06",xray_id:"XRAY-148211",vul_id:"CVE-2019-12110",severity:"high",discovered_by:"Ben Barnea",type:"vulnerability"}},{node:{id:"40f6c237de4deab7b34b44c3917cd6f0",path:"/vulnerabilities/minissdpd-updatedevice-uaf-xray-161552/",title:"MiniSSDPd updateDevice UaF",description:"CVE-2019-12106 High severity. The updateDevice function in MiniSSDPd allows a remote attacker to crash the process due to a Use-After-Free",date_published:"2019-02-06",xray_id:"XRAY-161552",vul_id:"CVE-2019-12106",severity:"high",discovered_by:"Ben Barnea",type:"vulnerability"}}]}},y=function(e){var i=e.options;i.__staticData?i.__staticData.data=u:(i.__staticData=o.a.observable({data:u}),i.computed=c({$static:function(){return i.__staticData.data}},i.computed))},b=Object(l.a)(d,(function(){var e=this,i=e.$createElement,t=e._self._c||i;return t("Layout",[t("div",{staticClass:"container py-10"},[t("g-link",{directives:[{name:"g-image",rawName:"v-g-image"}],staticClass:"hover:text-jfrog-green",attrs:{to:"/"},domProps:{innerHTML:e._s("< Back")}}),t("div",{staticClass:"flex flex-wrap gap-4 justify-between"},[t("div",{staticClass:"left"},[t("h1",{staticClass:"mt-5 mb-0 pb-2"},[e._v(" "+e._s(e.title)+" ")]),t("p",{staticClass:"text-xs"},[e._v("Last Updated On "),t("span",{staticClass:"font-bold"},[e._v(" "+e._s(e.latestPostDate)+" ")])])]),t("div",{staticClass:"right"},[t("BannerSmall",{attrs:{number:e.bannerNumber,title:e.bannerTitle}})],1)]),t("div",{staticClass:"posts pt-5 sm:pt-10"},[t("ul",{staticClass:"block"},e._l(e.activeChunk,(function(i){return t(e.VulnerListItem,{key:i.node.id,tag:"component",attrs:{vul:i.node}})})),1)]),t("div",{staticClass:"pagination pt-4"},[t("ul",{staticClass:"flex gap-2 flex-wrap max-w-full"},e._l(e.postsChunks,(function(i,a){return t("li",{key:a},[t("button",{class:e.getPaginationClass(a+1),on:{click:function(i){e.currentPage=a+1}}},[e._v("\n            "+e._s(a+1)+"\n          ")])])})),0)])],1)])}),[],!1,null,null,null);"function"==typeof y&&y(b);i.default=b.exports},VrYi:function(e,i,t){"use strict";var a={name:"BannerSmall",data:function(){return{bannerClass:"sr-banner sr-banner-small px-5 py-2 text-center bg-center bg-cover text-white bg-".concat(this.color)}},props:{color:{type:String,default:"jfrog-green"},number:{type:String,default:"500"},title:{type:String,default:"Vulnerabilities discovered"}}},r=(t("1rDP"),t("KHd+")),n=Object(r.a)(a,(function(){var e=this.$createElement,i=this._self._c||e;return i("div",{class:this.bannerClass},[i("div",{staticClass:"justify-between flex- flex items-center"},[i("div",{staticClass:"number mt-2"},[this._v(this._s(this.number))]),i("div",{directives:[{name:"g-image",rawName:"v-g-image"}],staticClass:"title text-left px-4",domProps:{innerHTML:this._s(this.title)}})])])}),[],!1,null,null,null);i.a=n.exports},h3Lo:function(e,i,t){},pDQq:function(e,i,t){"use strict";var a=t("I+eb"),r=t("I8vh"),n=t("ppGB"),s=t("UMSQ"),d=t("ewvW"),l=t("ZfDv"),o=t("hBjN"),c=t("Hd5f")("splice"),u=Math.max,y=Math.min;a({target:"Array",proto:!0,forced:!c},{splice:function(e,i){var t,a,c,b,v,p,h=d(this),f=s(h.length),m=r(e,f),_=arguments.length;if(0===_?t=a=0:1===_?(t=0,a=f-m):(t=_-2,a=y(u(n(i),0),f-m)),f+t-a>9007199254740991)throw TypeError("Maximum allowed length exceeded");for(c=l(h,a),b=0;b<a;b++)(v=m+b)in h&&o(c,b,h[v]);if(c.length=a,t<a){for(b=m;b<f-a;b++)p=b+t,(v=b+a)in h?h[p]=h[v]:delete h[p];for(b=f;b>f-a+t;b--)delete h[b-1]}else if(t>a)for(b=f-a;b>m;b--)p=b+t-1,(v=b+a-1)in h?h[p]=h[v]:delete h[p];for(b=0;b<t;b++)h[b+m]=arguments[b+2];return h.length=f-a+t,c}})},"q+sK":function(e,i,t){},vgRX:function(e,i,t){t("DQNa"),t("ma9I");e.exports={toBlogDateStr:function(e){var i=new Date(e),t=i.getDate(),a=i.toLocaleString("en-US",{month:"short"}),r=i.getFullYear();return"".concat(t," ").concat(a,". ").concat(r)},severityColor:function(e){var i="red";switch(e){case"low":i="yellow-300";break;case"medium":i="yellow-500";break;case"high":i="red-500";break;case"critical":i="red-700";break;default:i="gray-200"}return i}}}}]);