const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userData = [
    { name: 'User1', email: 'user1@example.com' },
    { name: 'User2', email: 'user2@example.com' },
    { name: 'User3', email: 'user3@example.com' },
    { name: 'User4', email: 'user4@example.com' },
    { name: 'User5', email: 'user5@example.com' },
  ];

  for (const user of userData) {
    try {
      await prisma.user.create({ data: user });
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`User with email ${user.email} already exists.`);
      } else {
        throw error;
      }
    }
  }

  const trackData = Array.from({ length: 20 }, (_, i) => ({
    title: `Track${i + 1}`,
    artist: `Artist${i + 1}`,
  }));

  for (const track of trackData) {
    await prisma.track.create({ data: track });
  }

  const allUsers = await prisma.user.findMany();
  const allTracks = await prisma.track.findMany();

  for (let i = 0; i < 10; i++) {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const randomTracks = allTracks.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 1);

    await prisma.playlist.create({
      data: {
        name: `Playlist${i + 1}`,
        description: `Description for Playlist${i + 1}`,
        owner: { connect: { id: randomUser.id } },
        tracks: { connect: randomTracks.map(track => ({ id: track.id })) },
      },
    });
  }
}

async function clearData() {
  await prisma.playlist.deleteMany();
  await prisma.track.deleteMany();
  await prisma.user.deleteMany();
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