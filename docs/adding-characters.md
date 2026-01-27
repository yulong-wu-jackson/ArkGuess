# 添加角色指南

自动从 PRTS Wiki 下载明日方舟角色头像并生成元数据。

---

## ⚡ 快速开始

### 推荐命令（最快）

```bash
python scripts/sync-characters.py --all --workers 10
```

### 其他选项

```bash
# 仅下载 5-6 星
python scripts/sync-characters.py

# 预览（不下载）
python scripts/sync-characters.py --all --dry-run

# 网络不稳定时
python scripts/sync-characters.py --all --workers 1
```

---

## 📋 下载范围

| 命令 | 稀有度 | 数量 |
|------|--------|------|
| `--all` 或 `--rarity 0` | 1-6★ | ~700+ |
| `--rarity 1` | 2-6★ | ~600+ |
| `--rarity 2` | 3-6★ | ~500+ |
| `--rarity 3` | 4-6★ | ~300+ |
| `--rarity 4` （默认） | 5-6★ | ~150+ |
| `--rarity 5` | 6★ only | ~100+ |

---

## 🎯 常用选项

```bash
--all              下载所有角色（1-6星）
--rarity N         最低稀有度（0-5）
--filter "名字"     只下载匹配的角色
--force            强制重新下载
--workers N        并发数（默认3，推荐10，范围1-10）
--dry-run          预览不下载
```

**💡 性能提示：**
- 使用 `--workers 10` 可大幅加速元数据获取
- 元数据用于验证有效干员（有稀有度+职业=保留）

---

## 📁 文件结构

### 使用中文文件名

```
public/images/arknights/
├── manifest.json       # 游戏用简单清单
├── metadata.json       # 富元数据（稀有度、职业、标签等）
├── 银灰.png
├── 陈.png
├── 阿米娅.png
└── 阿米娅(近卫).png    # ✅ 职业转换异格保留
```

**智能过滤（基于 Wiki 元数据）：**
- ✅ **有稀有度 + 职业** → 保留（包括 Mon3tr 等特殊单位）
- ❌ 皮肤 (`_skin1`, `_epoque`)
- ❌ 敌方单位 (`敌人_xxx`)
- ❌ 活动特殊版本 (`阿米娅(于万千宇宙之中)`)
- ❌ 无元数据单位 (`char_004_xxx`, 真正的召唤物)

---

## 📦 输出文件

### `manifest.json` - 游戏清单

```json
{
  "name": "明日方舟",
  "characters": [
    { "id": "银灰", "name": "银灰", "image": "银灰.png" }
  ]
}
```

### `metadata.json` - 富元数据

```json
{
  "characters": {
    "银灰": {
      "name": "银灰",
      "image": "银灰.png",
      "rarity": 5,
      "rarityLabel": "6星",
      "class": "近卫",
      "subclass": "领主",
      "tags": ["输出", "支援"],
      "position": "近战位",
      "faction": "谢拉格"
    }
  },
  "indexes": {
    "byRarity": { "6星": ["银灰", ...] },
    "byClass": { "近卫": ["银灰", ...] },
    "byTag": { "输出": ["银灰", ...] },
    "byFaction": { "谢拉格": ["银灰", ...] }
  }
}
```

---

## 🎮 未来玩法创意

利用 `metadata.json` 可实现：

| 玩法 | 使用索引 |
|------|---------|
| **稀有度挑战** "只用5星" | `byRarity` |
| **职业限定** "医疗干员专场" | `byClass` |
| **阵营战** "罗德岛 vs 谢拉格" | `byFaction` |
| **标签模式** "输出型干员" | `byTag` |
| **位置对抗** "近战位 vs 远程位" | `byPosition` |

---

## 🔧 手动添加单个角色

### 1. 获取图片 URL

```bash
curl -s "https://prts.wiki/api.php?action=query&titles=文件:头像_银灰.png&prop=imageinfo&iiprop=url&format=json"
```

### 2. 下载

```bash
curl -o "public/images/arknights/银灰.png" "<图片URL>"
```

### 3. 重新生成清单

```bash
# 手动添加后重新扫描生成清单
python scripts/sync-characters.py --dry-run
```

或直接重新下载该角色：

```bash
python scripts/sync-characters.py --filter <角色名> --force
```

---

## 📚 API 参考

**列出所有头像：**
```
https://prts.wiki/api.php?action=query&list=allimages&aiprefix=头像_&ailimit=500&format=json
```

**获取角色页面：**
```
https://prts.wiki/api.php?action=parse&page=银灰&prop=wikitext&format=json
```

---

## ❓ 常见问题

**Q: 下载很慢？**
A: 使用 `--no-metadata` 跳过元数据获取，或减少 `--workers` 数量

**Q: 图片下载失败？**
A: 检查网络，稍后重试，或使用 `--force` 重新下载

**Q: 如何更新已有角色？**
A: 使用 `--filter <角色名> --force`

**Q: 如何删除特定角色？**
A: 直接删除 `.png` 文件，然后重新生成清单

---

## 🔗 相关链接

- [干员一览 - PRTS Wiki](https://prts.wiki/w/干员一览)
- [PRTS Wiki API](https://prts.wiki/api.php)
- [脚本 README](../scripts/README.md)
