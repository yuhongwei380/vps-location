
## 1.需要NODEJS 和依赖

安装方法参照官方教程:

https://nodejs.org/zh-cn/download

依赖：
```
PUPPETEER_SKIP_DOWNLOAD=true npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

## 2.配置启动脚本和运行：
```
mkdir -p /root/google-location-fixer/
cat << 'EOF' > /root/google-location-fixer/run.sh
#!/bin/bash

# 1. 随机延迟 0-360 秒
sleep $((RANDOM % 360))

# 2. 切换目录并注入环境变量
cd /root/google-location-fixer
export TZ=America/Los_Angeles

# 3. 记录一条带有时间的启动日志（方便排错），然后执行 Node 脚本
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Triggering Node script after random sleep..." >> /var/log/google-fix.log
/root/.nvm/versions/node/v24.16.0/bin/node index.js >> /var/log/google-fix.log 2>&1
EOF
chmod +x /root/google-location-fixer/run.sh

(crontab -l 2>/dev/null; echo "0 0,4,8,12,16,20 * * * /root/google-location-fixer/run.sh") | crontab -

```

## 3.配置项目主代码
主代码默认为 洛杉矶，请拷贝主代码内容给AI，并且给出promot，例如：这是我的项目主代码，我希望把定位更改为 圣何塞，并且浏览器浏览的行为也对应修改。

git clone 本项目代码并且把index.js 拷贝到 `/root/google-location-fixer/`

