import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { CheckCircle, XCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth/auth-options"
import { ResendVerificationButton } from "@/components/dashboard/resend-verification-button"

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const isEmailVerified = !!session.user.emailVerified

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your personal account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                                <p className="text-base">{session.user.name || "Not set"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                                <p className="text-base">{session.user.email}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                                <p className="text-base">{session.user.role}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Organization</h3>
                                <p className="text-base">{session.user.organizationSlug || "Not set"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Email Verification</h3>
                                <div className="flex items-center mt-1">
                                    {isEmailVerified ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                            <span>
                                                Verified on{" "}
                                                {session.user.emailVerified
                                                    ? format(new Date(session.user.emailVerified), "PPP")
                                                    : "an unknown date"}
                                            </span>

                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5 text-amber-500 mr-2" />
                                            <span className="text-amber-600">Not verified</span>
                                            {session.user.email && (
                                                <ResendVerificationButton email={session.user.email} className="ml-2" />
                                            )}

                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
                                <p className="text-base">
                                    {/* You would need to add createdAt to your session data */}
                                    {/* {format(new Date(session.user.createdAt), "PPP")} */}
                                    Not available
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

