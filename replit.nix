{ pkgs }: {
    deps = [
        pkgs.nodePackages.typescript
        pkgs.nodejs-18_x,
        pkgs.nodePackages.yarn
    ];
}