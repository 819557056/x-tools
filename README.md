
## 项目说明

本项目是基于 [IT-Tools](https://github.com/CorentinTh/it-tools) 进行二次开发的版本。

感谢原项目作者 [Corentin Thomasset](https://github.com/CorentinTh) 提供的优秀基础框架。

**原始项目地址**：[https://github.com/CorentinTh/it-tools](https://github.com/CorentinTh/it-tools)

### 新增功能

- 🔐 **证书编码转换**：支持证书格式在不同编码方式之间的转换
- 📄 **证书解析**：提供证书内容的详细解析功能



## 部署

Self host solutions for your homelab

**From docker hub:**

```sh
docker run -d --name it-tools --restart unless-stopped -p 8080:80 corentinth/it-tools:latest
```

**From github packages:**

```sh
docker run -d --name it-tools --restart unless-stopped -p 8080:80 ghcr.io/corentinth/it-tools:latest
```

### 开发

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

### Create a new tool

To create a new tool, there is a script that generate the boilerplate of the new tool, simply run:

```sh
pnpm run script:create:tool my-tool-name
```

It will create a directory in `src/tools` with the correct files, and a the import in `src/tools/index.ts`. You will just need to add the imported tool in the proper category and develop the tool.



## 致谢

本程序使用了以下开源项目为基础：

- [IT-Tools](https://github.com/CorentinTh/it-tools) - 由 [Corentin Thomasset](https://github.com/CorentinTh) 创建的优秀开发者工具集合

感谢以上项目的作者和贡献者们的无私奉献！

## License

This project is under the [GNU GPLv3](LICENSE).
