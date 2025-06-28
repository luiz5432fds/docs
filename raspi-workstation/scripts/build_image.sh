#!/bin/bash
# Build a bootable image with Buildroot and include this project.
# Requirements: buildroot, git and a Linux host with necessary packages.

set -e

BUILDROOT_DIR=${BUILDROOT_DIR:-$PWD/buildroot}
OUTPUT_DIR=${OUTPUT_DIR:-$PWD/output}

if [ ! -d "$BUILDROOT_DIR" ]; then
    git clone https://github.com/buildroot/buildroot.git "$BUILDROOT_DIR"
fi

cp -r "$(dirname "$0")/.." "$BUILDROOT_DIR/board/raspi-workstation"

cd "$BUILDROOT_DIR"
make raspberrypi_defconfig
BR2_EXTERNAL="$PWD/board/raspi-workstation" make
mkdir -p "$OUTPUT_DIR"
cp output/images/sdcard.img "$OUTPUT_DIR/raspi-workstation.img"

echo "Imagem gerada em $OUTPUT_DIR/raspi-workstation.img"

