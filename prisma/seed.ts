import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin123",
    10
  );

  await prisma.adminUser.upsert({
    where: { username: process.env.ADMIN_USERNAME || "admin" },
    update: { passwordHash },
    create: {
      username: process.env.ADMIN_USERNAME || "admin",
      passwordHash,
    },
  });

  // Seed sample posts
  const posts = [
    {
      title: "initial_setup.log",
      slug: "initial-setup",
      category: "devlog",
      content:
        "홈서버 구축을 위한 첫 번째 기록. 라즈베리파이 5를 사용하여 기본 OS를 설치하고 SSH 접속 환경을 구성했다. 보안을 위해 포트 변경 및 키 기반 인증을 설정함.",
    },
    {
      title: "docker_compose_error_fix.md",
      slug: "docker-compose-error-fix",
      category: "troubleshooting",
      content:
        "Nginx Proxy Manager 컨테이너가 80포트 충돌로 실행되지 않는 문제 발생. netstat으로 확인해보니 아파치가 이미 돌고 있었다. 아파치 비활성화 후 정상 작동 확인.",
    },
    {
      title: "backup_strategy.sh",
      slug: "backup-strategy",
      category: "devlog",
      content:
        "데이터 손실 방지를 위한 3-2-1 백업 전략 수립. 로컬 NAS에 1차 백업, 클라우드 스토리지에 암호화하여 2차 백업하는 스크립트를 작성하여 cronjob에 등록했다.",
    },
    {
      title: "ssh_connection_timeout.log",
      slug: "ssh-connection-timeout",
      category: "troubleshooting",
      content:
        "외부 네트워크에서 SSH 접속 시 간헐적으로 타임아웃 발생. 방화벽 설정 확인 및 KeepAlive 옵션 조정으로 해결 시도 중.",
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  // Seed sample guestbook entries
  const existingEntries = await prisma.guestbookEntry.count();
  if (existingEntries === 0) {
    await prisma.guestbookEntry.createMany({
      data: [
        {
          author: "guest_01",
          message: "서버 컨셉 진짜 힙하네요!",
        },
        {
          author: "dev_kim",
          message: "도커 설정 글 잘 보고 갑니다.",
        },
      ],
    });
  }

  console.log("Seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
