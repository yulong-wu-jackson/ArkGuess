# 角色同步脚本

从 PRTS Wiki 自动下载明日方舟角色头像和元数据。

---

## ⚡ 一键运行

### 推荐命令（最快）

```bash
python3 scripts/sync-characters.py --all --workers 10
```

### 其他选项

```bash
# 仅 5-6 星（默认）
python3 scripts/sync-characters.py

# 预览模式
python3 scripts/sync-characters.py --all --dry-run

# 网络不稳定时
python3 scripts/sync-characters.py --all --workers 1
```

---

## 📊 稀有度选项

| 命令 | 范围 | 约数量 |
|------|------|--------|
| `--all` | 1-6★ | 700+ |
| `--rarity 4` | 5-6★ | 150+ |
| `--rarity 5` | 6★ | 100+ |
| `--rarity 3` | 4-6★ | 300+ |
| `--rarity 0` | 全部 | 700+ |

---

## 🎯 所有选项

```bash
--all              下载全部角色
--rarity N         最低稀有度 (0-5)
--filter "名字"     只下载匹配角色
--force            强制重新下载
--workers N        并发数 (默认: 3, 推荐: 10, 范围: 1-10)
--dry-run          预览不下载
```

**💡 性能提示：**
- 使用 `--workers 10` 可大幅加速（元数据获取并发）
- 网络不稳定时降低到 `--workers 1`
- 元数据获取是必需的（用于验证有效干员）

---

## 📝 使用示例

```bash
# 下载全部角色（1-6星，最快）
python3 scripts/sync-characters.py --all --workers 10

# 只下载 6 星（快速）
python3 scripts/sync-characters.py --rarity 5 --workers 10

# 下载特定角色
python3 scripts/sync-characters.py --filter 银灰

# 单线程下载（网络不稳定时）
python3 scripts/sync-characters.py --all --workers 1

# 强制更新所有（最快）
python3 scripts/sync-characters.py --all --force --workers 10

# 预览将下载什么
python3 scripts/sync-characters.py --all --dry-run
```

---

## 📦 输出文件

### `manifest.json` - 游戏用

简单清单，仅包含 ID、名称、图片：

```json
{
  "name": "明日方舟",
  "characters": [
    { "id": "银灰", "name": "银灰", "image": "银灰.png" }
  ]
}
```

### `metadata.json` - 未来功能

富元数据 + 索引：

```json
{
  "version": "1.0",
  "lastUpdated": "2026-01-26",
  "characters": {
    "银灰": {
      "name": "银灰",
      "rarity": 5,              // 0-5 (5=6星)
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
    "byFaction": { "谢拉格": ["银灰", ...] },
    "byPosition": { "近战位": ["银灰", ...] }
  }
}
```

---

## 🎮 未来玩法创意

利用 `metadata.json` 的索引可实现：

| 功能 | 索引 | 示例 |
|------|------|------|
| 稀有度过滤 | `byRarity` | "只玩 6 星模式" |
| 职业限定 | `byClass` | "医疗干员专场" |
| 标签筛选 | `byTag` | "只用输出型角色" |
| 阵营对战 | `byFaction` | "罗德岛 vs 谢拉格" |
| 位置挑战 | `byPosition` | "近战位 vs 远程位" |

---

## 🔧 技术细节

**智能过滤（基于 Wiki 元数据验证）：**
- ✅ **有稀有度 + 职业** → 保留（如 `银灰`, `Mon3tr`, `Castle-3`）
- ❌ 皮肤 (`_skin1`, `_epoque`)
- ❌ 敌方单位 (`敌人_xxx`)
- ❌ 活动版本 (`阿米娅(于万千宇宙之中)`)
- ❌ 无元数据单位 (`char_004_xxx`, `F91` 等)

**原则：** Wiki 有完整元数据 = 可用干员

**性能：**
- 使用线程池并发获取元数据
- SSL 证书处理自动化
- 智能跳过已存在文件
- 下载限速保护服务器

---

## 📚 更多信息

查看详细文档：[docs/adding-characters.md](../docs/adding-characters.md)
