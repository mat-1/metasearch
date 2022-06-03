{ pkgs }: {
    deps = [
        pkgs.nodePackages.typescript
        pkgs.nodejs-17_x
        pkgs.nodePackages.yarn
    ];
}