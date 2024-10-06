
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Facebook, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IDetailedParking } from "../custom/TimeBookingDialog"
import { useToast } from "@/hooks/use-toast"


function ShareModal({ location }: { location: IDetailedParking }) {
    const shareUrl = window.location.href;
    const { toast } = useToast();

    const handleShare = (platform: string) => {
        let shareUrl = ''
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
                break
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this parking spot: ${location.name}`)}`
                break
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(`Check out this parking spot: ${location.name}`)}`
                break
            default:
                return
        }
        window.open(shareUrl, '_blank')
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share this location</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex space-x-4">
                        <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}>
                            <Facebook className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}>
                            <Twitter className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}>
                            <Linkedin className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <p className="text-sm text-muted-foreground">Or share via QR Code</p>
                        <QRCodeSVG value={shareUrl} size={200} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            className="flex-1 px-3 py-2 text-sm border rounded-md"
                            value={shareUrl}
                            readOnly
                        />
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(shareUrl)
                                toast({
                                    title: "Copied to clipboard",
                                    description: "The link has been copied to your clipboard.",
                                })
                            }}
                        >
                            Copy
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ShareModal;