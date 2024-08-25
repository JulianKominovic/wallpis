# Wallpis

## Development

### Requisites

- Go
- Homebrew
- Cross compiler gcc

```bash
brew tap SergioBenitez/osxct
brew install x86_64-unknown-linux-gnu
```

### Environment variables

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
STATS_ROUTE=...
```

### Deploy instructions

1. Run `pnpm run build` (compiles go binary & compile tailwind css file)
2. Stop active process running on VPS
3. Do a git pull in VPS machine
4. Copy binary file to VPS machine

```bash
scp -r ./main <user>@<ip>:<location>
```

5. Run binary file (don't forget to load env vars)

## References

- https://dev.to/j3rry320/deploy-your-nextjs-app-like-a-pro-a-step-by-step-guide-using-nginx-pm2-certbot-and-git-on-your-linux-server-3286
- https://stackoverflow.com/questions/57924093/error-could-not-find-a-profile-matching-nginx-full
