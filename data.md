# Kiểm Tra Git Hiện Tại
git remote -v

# Đổi Git
git remote set-url origin https://github.com/kevin4relocate/relocateatlas.git

# Nếu Dùng Git Cũ
git config --global user.name
git config --global user.email

git config --global user.name "Jessica"
git config --global user.email "new@email.com"
Lưu ý: user.name và user.email chỉ ảnh hưởng đến thông tin commit, không quyết định tài khoản đăng nhập GitHub.

git credential-osxkeychain erase