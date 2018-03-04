#!/bin/bash

OUT=sourcecode-archive.tar.gz
git archive HEAD -1 -o $OUT

echo $OUT written.

