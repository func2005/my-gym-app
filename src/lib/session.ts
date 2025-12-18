import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.SESSION_SECRET || 'your-secret-key-change-me'
const key = new TextEncoder().encode(secretKey)

export type SessionPayload = {
    id: number
    phone?: string // Member
    username?: string // Admin
    role: 'member' | 'admin' | 'super_admin'
    expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key)
}

export async function decrypt(app_session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(app_session, key, {
            algorithms: ['HS256'],
        })
        return payload as unknown as SessionPayload
    } catch (error) {
        return null
    }
}

export async function createSession(id: number, role: 'member' | 'admin', identifier: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const payload: SessionPayload = {
        id,
        role,
        expiresAt,
    }

    if (role === 'member') {
        payload.phone = identifier
    } else {
        payload.username = identifier
    }

    const session = await encrypt(payload)

        ; (await cookies()).set('session', session, {
            httpOnly: true,
            secure: true,
            expires: expiresAt,
            sameSite: 'lax',
            path: '/',
        })
}

export async function verifySession() {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    if (!session?.id) {
        return null
    }

    return { isAuth: true, userId: session.id, role: session.role }
}

export async function deleteSession() {
    ; (await cookies()).delete('session')
}
