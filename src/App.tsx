// Removed unused React import
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Flex } from "@/components/layout/flex";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { InfoIcon, CheckCircle } from "lucide-react";
import { H1, H2, Muted, P } from "./components/ui/typography";

function App() {
  return (
    <div className="p-12">
      <Container>
        <header className="mb-8">
          <Flex justify="between" align="center">
            <H1>Design System</H1>
            <ThemeSwitcher />
          </Flex>
          <P className="mt-4">
            A comprehensive design system built with Vite, React, TypeScript,
            Tailwind CSS, and shadcn/ui.
          </P>
        </header>

        {/* Components Showcase */}
        <Grid cols={1} colsMd={2} gap="lg" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Various button variants and sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex gap="sm" className="mb-4 flex-wrap">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </Flex>
              <Flex gap="sm" className="flex-wrap">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges & Alerts</CardTitle>
              <CardDescription>
                Status indicators and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex gap="sm" className="mb-6 flex-wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="default">Success</Badge>
              </Flex>

              <Alert className="mb-4">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  This is an informational alert.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields and controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    type="email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                  />
                </div>
                <Button className="w-full">Submit</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Text styles and hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <H1 className="text-2xl">Heading 1</H1>
              <H2 className="text-xl">Heading 2</H2>
              <P>Regular paragraph text with standard styling.</P>
              <Muted>Muted text for secondary information.</Muted>
            </CardContent>
          </Card>
        </Grid>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Layout System</CardTitle>
            <CardDescription>
              Container, Grid, and Flex utilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <P className="mb-4">
              This entire page uses our layout system with Container, Grid, and
              Flex components for consistent spacing and alignment.
            </P>
            <Alert variant="default" className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Complete Design System</AlertTitle>
              <AlertDescription>
                The design system supports both light and dark themes with
                consistent styling across all components.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Muted>
              Design tokens are configured for colors, spacing, typography,
              border-radius, and shadows.
            </Muted>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
}

export default App;
