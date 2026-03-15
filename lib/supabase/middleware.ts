import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getTrackByProgramType } from '@/lib/tracks'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured, allow request to continue
    return supabaseResponse
  }

  try {
    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if user is accessing protected routes
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/protected')

    if (isProtectedRoute && !user) {
      // no user, redirect to login page
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    if (isProtectedRoute && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("program_type")
        .eq("id", user.id)
        .single()

      const track = getTrackByProgramType(profile?.program_type)
      const isComingSoon = track?.status === "coming_soon"

      const pathname = request.nextUrl.pathname
      const allowlist = [
        "/dashboard/profile",
        "/dashboard/settings",
        "/dashboard/pricing",
      ]

      const isAllowlisted = allowlist.some((path) => pathname.startsWith(path))

      if (isComingSoon && pathname.startsWith("/dashboard") && !isAllowlisted) {
        const url = request.nextUrl.clone()
        url.pathname = `/tracks/${track?.slug}/coming-soon`
        return NextResponse.redirect(url)
      }
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    return supabaseResponse
  } catch (error) {
    // If there's an error with Supabase, allow the request to continue
    // This prevents the app from crashing if Supabase is misconfigured
    console.error('[v0] Supabase middleware error:', error)
    return supabaseResponse
  }
}
