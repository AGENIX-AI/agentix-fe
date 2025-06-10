
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Waitlist = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-muted to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-lg border border-muted">
          <CardHeader className="pb-0">
            <div className="flex justify-center mb-6">
              <img 
                src="https://edvara-bucket.sgp1.cdn.digitaloceanspaces.com/public/Edvara-Full-Logo-Teal-1024-removebg-preview.png" 
                alt="Edvara Logo" 
                className="h-16 object-contain"
              />
            </div>
            <CardTitle className="text-center text-2xl font-bold text-primary">
              Yay, you're on the waitlist!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [0.98, 1, 0.98]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2.5 
                }}
                className="text-lg font-medium text-primary"
              >
                Waiting...
              </motion.div>
              <p className="text-muted-foreground">
                Your account has been created successfully but is pending approval from our team.
              </p>
              <p className="text-muted-foreground">
                You'll receive an email notification once your account is approved.
              </p>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="px-6 py-2 border-primary text-primary hover:bg-accent transition-all duration-300"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Waitlist;
