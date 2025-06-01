import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

interface UseZodFormProps<TFieldValues extends FieldValues, TContext = any> extends UseFormProps<TFieldValues, TContext> {
  schema: ZodSchema<TFieldValues>;
}

export function useZodForm<TFieldValues extends FieldValues, TContext = any>(
  props: UseZodFormProps<TFieldValues, TContext>
): UseFormReturn<TFieldValues, TContext> {
  const { schema, ...rest } = props;
  const form = useForm<TFieldValues, TContext>({
    ...rest,
    resolver: zodResolver(schema),
  });

  return form;
} 