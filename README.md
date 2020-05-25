## 代码规范 standard 

- [Standard - JavaScript 代码规范](https://standardjs.com/readme-zhcn.html)

- 检查:
> npm test

- 自动格式化
> standard --fix

- git 添加 pre-commit
> "pre-commit": "standard --verbose | snazzy"

```
  "husky": {
    "hooks": {
      "pre-commit": "standard --verbose | snazzy"
    }
  }
```

- 格式化输出
> standard --verbose | snazzy

- WebStorm standard 配置方法：https://blog.jetbrains.com/webstorm/2017/01/webstorm-2017-1-eap-171-2272/

## 环境安装

> npm install

## Issue

- 目前最多只能加4路流

- blob 格式的 video 怎么下载？

## 参考

- [MultiStreamRecorder.js & MediaStreamRecorder](http://localhost:63342/MediaStreamRecorder/demos/MultiStreamRecorder.html?_ijt=5i6u5ds8a3on7jl8b5jft59og8)

## FAQ

-  standard 无法检查到调用的外部函数或变量

