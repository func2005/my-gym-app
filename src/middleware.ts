import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value
    const session = await decrypt(sessionCookie)

    const isAuth = !!session?.id
    const { pathname } = request.nextUrl

    // 1. 如果未登录，且访问受保护路由 -> 跳转登录
    if (!isAuth && (pathname.startsWith('/admin') || pathname.startsWith('/member'))) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. 如果已登录
    if (isAuth) {
        // 角色访问控制
        if (pathname.startsWith('/admin') && session.role !== 'admin') {
            return NextResponse.redirect(new URL('/member/dashboard', request.url))
        }
        if (pathname.startsWith('/member') && session.role !== 'member') {
            // 管理员可以访问会员页面吗？一般不可以，管理员有自己的界面。
            // 为了方便，让管理员也能回到后台
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }

        // 已登录用户访问 /login -> 跳转回各自 Dashboard
        if (pathname === '/login') {
            if (session.role === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url))
            } else {
                return NextResponse.redirect(new URL('/member/dashboard', request.url))
            }
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/member/:path*', '/login'],
}
