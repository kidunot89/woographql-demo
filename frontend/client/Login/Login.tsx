import { useEffect } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { useSession } from '@woographql/client/SessionProvider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@woographql/ui/form';
import { Input } from '@woographql/ui/input';
import { Button } from '@woographql/ui/button';
import { LoadingSpinner } from '@woographql/ui/LoadingSpinner';

export const LoginSchema = z.object({
  username: z.string().min(4, {
    message: 'Username must be at least 4 characters long',
  }),
  password: z.string().min(1, {
    message: 'Password must enter a password',
  })
});

export function Login() {
  const { login, isAuthenticated, fetching } = useSession();
  const router = useRouter();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated]);

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    login(data.username, data.password);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-screen-lg mx-auto px-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username or e-mail associate with your account." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={fetching}
          className="flex gap-x-2 items-center"
        >
          Submit
          {fetching && <LoadingSpinner noText />}
        </Button>
      </form>
    </Form>
  );
}