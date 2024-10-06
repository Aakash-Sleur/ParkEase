import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function RequestsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Parking Requests</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Input placeholder="Search requests..." className="max-w-sm" />
                        <Button>Search</Button>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="p-2 text-left">User</th>
                                <th className="p-2 text-left">Location</th>
                                <th className="p-2 text-left">Date</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2">John Doe</td>
                                <td className="p-2">Central Park</td>
                                <td className="p-2">2023-06-15</td>
                                <td className="p-2">Pending</td>
                                <td className="p-2">
                                    <Button variant="outline" size="sm">Approve</Button>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2">Jane Smith</td>
                                <td className="p-2">Downtown Lot</td>
                                <td className="p-2">2023-06-16</td>
                                <td className="p-2">Approved</td>
                                <td className="p-2">
                                    <Button variant="outline" size="sm">Cancel</Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
