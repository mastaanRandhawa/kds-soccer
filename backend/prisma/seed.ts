import { PrismaClient, MatchRound, MatchStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.username);

  // Create tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: "main-tournament" },
    update: {},
    create: {
      id: "main-tournament",
      name: "KDS Soccer Championship 2026",
      description: "Annual soccer tournament bringing together the best teams from across the region.",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-30"),
      isActive: true,
    },
  });

  console.log("Created tournament:", tournament.name);

  // Create teams
  const teams = [
    { name: "Thunder FC", location: "North District", coachName: "John Smith" },
    { name: "Lightning United", location: "South District", coachName: "Sarah Johnson" },
    { name: "Storm Athletics", location: "East District", coachName: "Mike Davis" },
    { name: "Hurricane SC", location: "West District", coachName: "Emily Brown" },
    { name: "Blaze FC", location: "Central District", coachName: "Chris Wilson" },
    { name: "Phoenix Rising", location: "Downtown", coachName: "Alex Taylor" },
    { name: "Titans SC", location: "Harbor District", coachName: "Jordan Lee" },
    { name: "Warriors United", location: "Hill District", coachName: "Sam Martinez" },
  ];

  const createdTeams = [];
  for (const team of teams) {
    const created = await prisma.team.create({
      data: team,
    });
    createdTeams.push(created);
    console.log("Created team:", created.name);
  }

  // Create quarterfinal matches
  const matches = [
    {
      team1Id: createdTeams[0].id,
      team2Id: createdTeams[1].id,
      round: MatchRound.QUARTERFINAL,
      status: MatchStatus.COMPLETED,
      score1: 2,
      score2: 1,
      matchDate: new Date("2026-06-10T14:00:00"),
    },
    {
      team1Id: createdTeams[2].id,
      team2Id: createdTeams[3].id,
      round: MatchRound.QUARTERFINAL,
      status: MatchStatus.COMPLETED,
      score1: 3,
      score2: 2,
      matchDate: new Date("2026-06-10T16:00:00"),
    },
    {
      team1Id: createdTeams[4].id,
      team2Id: createdTeams[5].id,
      round: MatchRound.QUARTERFINAL,
      status: MatchStatus.LIVE,
      score1: 1,
      score2: 1,
      matchDate: new Date("2026-06-11T14:00:00"),
    },
    {
      team1Id: createdTeams[6].id,
      team2Id: createdTeams[7].id,
      round: MatchRound.QUARTERFINAL,
      status: MatchStatus.SCHEDULED,
      matchDate: new Date("2026-06-11T16:00:00"),
    },
    {
      team1Id: createdTeams[0].id,
      team2Id: createdTeams[2].id,
      round: MatchRound.SEMIFINAL,
      status: MatchStatus.SCHEDULED,
      matchDate: new Date("2026-06-20T14:00:00"),
    },
  ];

  for (const match of matches) {
    await prisma.match.create({
      data: match,
    });
  }

  console.log("Created matches");

  // Create media
  const mediaItems = [
    {
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
      description: "Stadium during championship match",
      category: "stadium",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800",
      description: "Team celebration after winning",
      category: "celebration",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
      description: "Soccer ball on the field",
      category: "action",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800",
      description: "Fans cheering in the stands",
      category: "fans",
    },
  ];

  for (const media of mediaItems) {
    await prisma.media.create({
      data: media,
    });
  }

  console.log("Created media items");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
