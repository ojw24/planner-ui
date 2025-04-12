FROM nginx:alpine

# 기본 정적 파일 복사
COPY build /usr/share/nginx/html

# 커스텀 nginx 설정 덮어쓰기
COPY docker/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]