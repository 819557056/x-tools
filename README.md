
## 项目说明

本项目是基于 [IT-Tools](https://github.com/CorentinTh/it-tools) 进行二次开发的版本。

感谢原项目作者 [Corentin Thomasset](https://github.com/CorentinTh) 提供的优秀基础框架。

**原始项目地址**：[https://github.com/CorentinTh/it-tools](https://github.com/CorentinTh/it-tools)

### 新增功能

#### 🔐 证书工具套件

本项目提供了完整的证书处理工具链，支持国密（SM2/SM3）和国际标准（RSA/ECDSA）算法：

- **证书编码转换 (Certificate Encoder)**
  - 支持 PEM、DER、Base64、HEX 等多种格式互转
  - 智能识别输入格式（自动检测）
  - 支持文件拖放上传和批量处理
  - 一键复制转换结果

- **证书查看器 (Certificate Viewer)** ⭐ 核心功能
  
  基于 [node-forge](https://github.com/digitalbazaar/forge) 开发，提供企业级证书解析能力：
  
  **支持的证书类型：**
  - ✅ RSA 证书（1024-4096 位）
  - ✅ ECDSA 证书（P-256、P-384、P-521 曲线）
  - ✅ **国密 SM2 证书**（完整支持）
  
  **核心特性：**
  - ✅ **UTF-8 编码完美支持** - 正确显示中文证书字段（如国密证书中的中文单位名称）
  - ✅ **智能格式识别** - 自动识别 PEM、Base64、DER、HEX 格式
  - ✅ **多种输入方式** - 文本粘贴、文件上传、拖放操作
  
  **详细信息展示：**
  - 📋 基本信息：版本、序列号、签名算法（自动识别国密算法）
  - 👤 身份信息：颁发者（Issuer）和使用者（Subject）的 DN 信息
  - 📅 有效期：自动检查证书是否有效、过期或未生效
  - 🔑 公钥信息：
    - RSA：模数、指数、密钥长度
    - EC/SM2：曲线名称、公钥数据、密钥长度
  
  **扩展字段解析**（完整实现）：
  - ✅ **keyUsage** - 密钥用途（数字签名、密钥加密、证书签名等）
  - ✅ **extKeyUsage** - 扩展密钥用途（服务器认证、客户端认证、代码签名等）
  - ✅ **basicConstraints** - 基本约束（CA 标识、路径长度限制）
  - ✅ **subjectAltName** - 主体备用名称（DNS、IP、URI）
  - ✅ **cRLDistributionPoints** - CRL 分发点（显示完整下载地址）
  - ✅ **authorityInfoAccess** - 颁发机构信息访问（OCSP、CA Issuers）
  - ✅ **certificatePolicies** - 证书策略（Policy OID、CPS）
  - ✅ **subjectKeyIdentifier** - 主体密钥标识符
  - ✅ **authorityKeyIdentifier** - 颁发机构密钥标识符
  - ✅ 未知扩展自动解析为可读格式
  
  **数据展示优化：**
  - 🔢 十六进制数据规范显示（空格分隔，便于复制）
  - 🔐 证书指纹计算（SHA-256、SHA-1、MD5）
  - 📤 原始数据导出（PEM、DER 格式）
  - 📋 一键复制任意字段

- **证书解析器 (Certificate Parser)** - ASN.1 结构查看器
  
  基于 [ASN.1 JavaScript decoder](https://github.com/lapo-luchini/asn1js) by Lapo Luchini：
  
  - 🌲 交互式 ASN.1 树形结构浏览
  - 🔍 支持解析多种格式：
    - X.509 证书
    - PKCS#7/CMS 加密消息
    - PKCS#8/PKCS#1 密钥
    - 其他 ASN.1 DER/BER 结构
  - 🌐 完全离线可用（内嵌完整解析器）
  - 💻 支持中文字段显示（UTF-8 优化）



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
- [ASN.1 JavaScript decoder](https://github.com/lapo-luchini/asn1js) - 由 [Lapo Luchini](https://github.com/lapo-luchini) 开发的通用 ASN.1 解析器，为证书解析器提供核心功能支持
- [node-forge](https://github.com/digitalbazaar/forge) - 用于证书查看器的加密算法和证书解析库

感谢以上项目的作者和贡献者们的无私奉献！

## License

This project is under the [GNU GPLv3](LICENSE).
