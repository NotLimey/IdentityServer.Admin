// Original source code: https://github.com/alan2207/react-query-auth
// Author: Alan Alickovic Modified by Eirik Sjøløkken

import { CircularProgress } from '@mui/material';
import React from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutateAsyncFunction,
  QueryObserverResult,
  RefetchOptions,
} from 'react-query';

import { AuthUser } from '@/features/auth';
// eslint-disable-next-line no-restricted-imports
import { NotLoggedIn } from '@/features/auth/components/NotLoggedIn';

export interface AuthProviderConfig<User = unknown, Error = unknown> {
  key?: string;
  loadUser: (data: any) => Promise<User>;
  loginFn: (data: any) => Promise<User>;
  registerFn: (data: any) => Promise<User>;
  logoutFn: () => Promise<any>;
  waitInitial?: boolean;
  LoaderComponent?: () => JSX.Element;
  NotLoggedInComponent?: () => JSX.Element;
  ErrorComponent?: ({ error }: { error: Error | null }) => JSX.Element;
}

export interface AuthContextValue<
  User = unknown,
  Error = unknown,
  LoginCredentials = unknown,
  RegisterCredentials = unknown
> {
  user: User | undefined;
  login: UseMutateAsyncFunction<User, any, LoginCredentials>;
  logout: UseMutateAsyncFunction<any, any, void, any>;
  register: UseMutateAsyncFunction<User, any, RegisterCredentials>;
  isLoggingIn: boolean;
  isLoggedIn: boolean;
  isLoggingOut: boolean;
  isRegistering: boolean;
  refetchUser: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<User, Error>>;
  error: Error | null;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function initReactQueryAuth<
  User = unknown,
  Error = unknown,
  LoginCredentials = unknown,
  RegisterCredentials = unknown
>(config: AuthProviderConfig<User, Error>) {
  const AuthContext = React.createContext<AuthContextValue<
    User,
    Error,
    LoginCredentials,
    RegisterCredentials
  > | null>(null);
  AuthContext.displayName = 'AuthContext';

  const {
    loadUser,
    loginFn,
    registerFn,
    logoutFn,
    key = 'auth-user',
    waitInitial = true,
    LoaderComponent = () => (
      <div className="w-screen h-screen flex justify-center items-center">
        <CircularProgress />
      </div>
    ),
    NotLoggedInComponent = () => <NotLoggedIn />,
    ErrorComponent = (error: any) => (
      <div style={{ color: 'tomato' }}>{JSON.stringify(error, null, 2)}</div>
    ),
  } = config;

  function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const queryClient = useQueryClient();
    const {
      data: user,
      error,
      status,
      isLoading,
      isIdle,
      isSuccess,
      refetch,
    } = useQuery<User, Error>({
      queryKey: key,
      queryFn: loadUser,
    });

    const setUser = React.useCallback(
      (data: User) => queryClient.setQueryData(key, data),
      [queryClient]
    );
    const loginMutation = useMutation({
      mutationFn: loginFn,
      onSuccess: (user) => {
        setUser(user);
      },
    });

    const registerMutation = useMutation({
      mutationFn: registerFn,
      onSuccess: (user) => {
        setUser(user);
      },
    });

    const logoutMutation = useMutation({
      mutationFn: logoutFn,
      onSuccess: () => {
        queryClient.clear();
      },
    });

    const isLoggedIn = !!(user as unknown as AuthUser)?.data;

    const value = React.useMemo(
      () => ({
        user,
        error,
        refetchUser: refetch,
        login: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isLoading,
        isLoggedIn: isLoggedIn,
        logout: logoutMutation.mutateAsync,
        isLoggingOut: logoutMutation.isLoading,
        register: registerMutation.mutateAsync,
        isRegistering: registerMutation.isLoading,
      }),
      [
        user,
        error,
        refetch,
        loginMutation.mutateAsync,
        loginMutation.isLoading,
        isLoggedIn,
        logoutMutation.mutateAsync,
        logoutMutation.isLoading,
        registerMutation.mutateAsync,
        registerMutation.isLoading,
      ]
    );

    if ((isSuccess || !waitInitial) && !isLoggedIn) {
      return <NotLoggedInComponent />;
    }

    if ((isSuccess || !waitInitial) && isLoggedIn) {
      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    }

    if (isLoading || isIdle) {
      return <LoaderComponent />;
    }

    if (error) {
      return <ErrorComponent error={error} />;
    }

    return <div>Unhandled status: {status}</div>;
  }

  function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
      throw new Error(`useAuth must be used within an AuthProvider`);
    }
    return context;
  }

  return { AuthProvider, AuthConsumer: AuthContext.Consumer, useAuth };
}
