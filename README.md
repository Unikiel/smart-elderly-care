# 智养问卷

面向养老院调研的多端问卷站：长者/家属大字填写，工作人员管理、导出，并可随时新建问卷。

本地演示不需要 Docker。数据存在 `data/store.json`。

## 本地预览

```bash
cd d:\Forge\Workshop\smart-elderly-care
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

| 入口 | 说明 |
|---|---|
| `/` | 填写入口 |
| `/s/ai-demo` | AI 智慧养老需求问卷（18 题） |
| `/s/meal-demo` | 餐食追访问卷（11 题） |
| `/login` | 工作人员 |

演示账号：`admin` / `changeit`

## 建议怎么点

1. 手机宽度（约 390）走完一份问卷并提交
2. 登录后台看队列、打开答卷
3. 问卷 → 复制一份 → 改题 → 发布 → 在「答卷」里生成邀请
4. 导出 CSV，用 Excel 打开
