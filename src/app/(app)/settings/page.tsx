

"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ProfileForm } from "@/components/settings/profile-form"
import { AppearanceForm } from "@/components/settings/appearance-form"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
       <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Tabs defaultValue="profile" className="flex flex-col sm:flex-row gap-6">
          <TabsList className="flex flex-row sm:flex-col h-auto sm:h-full bg-transparent sm:bg-muted p-1 items-start">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          <div className="flex-1">
            <TabsContent value="profile">
                <Card>
                    <CardContent className="pt-6">
                        <ProfileForm />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="appearance">
                 <Card>
                    <CardContent className="pt-6">
                        <AppearanceForm />
                    </CardContent>
                </Card>
            </TabsContent>
          </div>
        </Tabs>
    </div>
  )
}
