# 添加角色指南

本文档介绍如何从 PRTS Wiki 可靠地下载明日方舟角色头像，并将其添加到游戏中。

---

## 目录

1. [获取角色头像 URL](#获取角色头像-url)
2. [下载角色头像](#下载角色头像)
3. [更新 manifest.json](#更新-manifestjson)
4. [验证图片](#验证图片)
5. [常见问题](#常见问题)

---

## 获取角色头像 URL

### 方法一：使用 PRTS Wiki API（推荐）

PRTS Wiki 提供 MediaWiki API 来查询图片 URL。使用以下格式：

```
https://prts.wiki/api.php?action=query&titles=文件:头像_[角色名].png&prop=imageinfo&iiprop=url&format=json
```

**示例：获取阿米娅的头像 URL**

```bash
curl "https://prts.wiki/api.php?action=query&titles=文件:头像_阿米娅.png&prop=imageinfo&iiprop=url&format=json"
```

响应示例：
```json
{
  "query": {
    "pages": {
      "12345": {
        "title": "文件:头像 阿米娅.png",
        "imageinfo": [
          {
            "url": "https://media.prts.wiki/a/ab/%E5%A4%B4%E5%83%8F_%E9%98%BF%E7%B1%B3%E5%A8%85.png"
          }
        ]
      }
    }
  }
}
```

从响应中提取 `imageinfo[0].url` 字段即可获得图片直链。

### 方法二：直接访问 PRTS Wiki 页面

1. 访问 https://prts.wiki/w/干员一览
2. 点击目标角色进入详情页
3. 右键点击头像 → 复制图片地址

---

## 下载角色头像

### 使用 curl 下载

```bash
# 单个角色
curl -o "角色英文ID.png" "图片URL"

# 示例：下载阿米娅
curl -o "amiya.png" "https://media.prts.wiki/a/ab/%E5%A4%B4%E5%83%8F_%E9%98%BF%E7%B1%B3%E5%A8%85.png"
```

### 批量下载脚本

创建一个 shell 脚本批量下载：

```bash
#!/bin/bash
# download-characters.sh

# 定义角色映射：英文ID|中文名
characters=(
  "amiya|阿米娅"
  "chen|陈"
  "silverash|银灰"
)

for char in "${characters[@]}"; do
  id="${char%%|*}"
  name="${char##*|}"

  # 获取图片 URL
  url=$(curl -s "https://prts.wiki/api.php?action=query&titles=文件:头像_${name}.png&prop=imageinfo&iiprop=url&format=json" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); pages=d['query']['pages']; print(list(pages.values())[0].get('imageinfo',[{}])[0].get('url',''))")

  if [ -n "$url" ]; then
    echo "下载 ${name} (${id})..."
    curl -o "public/images/arknights/${id}.png" "$url"
  else
    echo "错误: 未找到 ${name} 的图片"
  fi
done
```

---

## 更新 manifest.json

下载图片后，需要在 `public/images/arknights/manifest.json` 中添加角色信息：

```json
{
  "name": "明日方舟",
  "characters": [
    {
      "id": "amiya",
      "name": "阿米娅",
      "image": "amiya.png"
    },
    {
      "id": "chen",
      "name": "陈",
      "image": "chen.png"
    }
  ]
}
```

### 字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `id` | 唯一标识符（英文小写，用连字符分隔） | `silverash`, `projekt-red` |
| `name` | 中文显示名称 | `银灰`, `红` |
| `image` | 图片文件名（与 id 对应） | `silverash.png` |

### 命名规范

- **id**: 使用英文小写，多词用连字符连接
  - 正确: `silverash`, `projekt-red`, `ch-en`
  - 错误: `SilverAsh`, `projekt_red`
- **name**: 使用游戏内官方中文名
- **image**: `{id}.png` 格式

---

## 验证图片

### 验证图片完整性

确保下载的图片不是损坏或错误的：

```bash
# 检查图片是否为有效 PNG
file public/images/arknights/*.png | grep -v "PNG image data"

# 检查重复图片（相同 MD5 = 重复）
cd public/images/arknights
md5 *.png | sort -k4 | uniq -D -f3
```

### 在游戏中验证

1. 启动开发服务器：`pnpm dev`
2. 访问 http://localhost:5173
3. 选择主题并进入角色选择
4. 检查每个角色的头像是否与名称匹配

---

## 常见问题

### 角色名在 Wiki 上不同

某些角色在 Wiki 上的名称与游戏内不同：

| 游戏内名称 | Wiki 图片名称 |
|-----------|--------------|
| 和弦寂静 | 和弦 |
| 红 | 红 |

使用 Wiki 搜索功能确认正确名称：
```bash
curl "https://prts.wiki/api.php?action=query&list=search&srsearch=角色名&format=json"
```

### API 返回 missing

如果 API 响应包含 `"missing": ""` 字段，说明图片文件不存在。请检查：
1. 角色名是否正确
2. 是否需要使用不同的名称变体

### 图片太大

PRTS Wiki 头像通常为 180x180 像素。如需调整大小：

```bash
# 使用 ImageMagick 调整大小
convert input.png -resize 180x180 output.png

# 或使用 sips (macOS)
sips -z 180 180 input.png --out output.png
```

---

## 完整添加流程示例

以添加"银灰"为例：

```bash
# 1. 获取图片 URL
curl -s "https://prts.wiki/api.php?action=query&titles=文件:头像_银灰.png&prop=imageinfo&iiprop=url&format=json"

# 2. 下载图片
curl -o public/images/arknights/silverash.png "https://media.prts.wiki/..."

# 3. 验证图片
file public/images/arknights/silverash.png

# 4. 更新 manifest.json
# 添加:
# {
#   "id": "silverash",
#   "name": "银灰",
#   "image": "silverash.png"
# }

# 5. 测试
pnpm dev
```

---

## PRTS Wiki 资源链接

- 干员一览: https://prts.wiki/w/干员一览
- Wiki API: https://prts.wiki/api.php
- 图片服务器: https://media.prts.wiki/
