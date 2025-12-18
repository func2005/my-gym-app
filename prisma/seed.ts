import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // 1. Clean up
    await prisma.admin.deleteMany({})
    await prisma.member.deleteMany({})

    // 2. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.admin.create({
        data: {
            username: 'admin',
            password: adminPassword,
            role: 'SUPER_ADMIN'
        }
    })
    console.log('Created Admin:', admin.username)

    // 3. Create Member
    const memberPassword = await bcrypt.hash('123456', 10)
    const member = await prisma.member.create({
        data: {
            phone: '13800138000',
            password: memberPassword,
            name: '张三 (测试)',
            expiryDate: new Date('2025-12-31'),
        }
    })
    console.log('Created Member:', member.name)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
