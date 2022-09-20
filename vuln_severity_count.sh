#!/bin/bash

echo Low: $(grep -l 'severity: low' vulnerabilities/*.md | wc -l)
echo Medium: $(grep -l 'severity: medium' vulnerabilities/*.md | wc -l)
echo High: $(grep -l 'severity: high' vulnerabilities/*.md | wc -l)
echo Critical: $(grep -l 'severity: critical' vulnerabilities/*.md | wc -l)