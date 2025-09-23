import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TestShadcnComponent() {
  return (
    <div className='p-8 space-y-4'>
      <h1 className='text-2xl font-bold'>shadcn/ui Test Component</h1>

      <Card className='w-96'>
        <CardHeader>
          <CardTitle>Welcome to shadcn/ui!</CardTitle>
          <CardDescription>This is a test component to verify shadcn/ui is working correctly.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-4'>
            <Avatar>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium'>shadcn</p>
              <p className='text-xs text-muted-foreground'>UI Components</p>
            </div>
          </div>

          <div className='flex space-x-2'>
            <Button>Primary</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='outline'>Outline</Button>
          </div>

          <div className='flex space-x-2'>
            <Badge>Default</Badge>
            <Badge variant='secondary'>Secondary</Badge>
            <Badge variant='outline'>Outline</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
