FROM nginx:alpine
# 删除ngnix的默认页面
RUN rm -rf /usr/share/nginx/html/*
# 删除nginx默认配置
RUN rm -rf /etc/nginx/conf.d/*
# 复制自定义nginx配置到容器中
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
# 暴露80端口
EXPOSE 80
# 将nginx转为前台进程
CMD ["nginx", "-g", "daemon off;"]
