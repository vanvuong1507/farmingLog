import {z} from 'zod';

/** i18n `t` — chỉ dùng keys form log. */
export type AddEditLogFormTranslate = (key: string) => string;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function createAddEditLogFormSchema(t: AddEditLogFormTranslate) {
  return z.object({
    activityName: z
      .string()
      .transform(s => s.trim())
      .pipe(z.string().min(1, {message: t('activityNameRequired')})),
    date: z
      .string()
      .transform(s => s.trim())
      .pipe(
        z
          .string()
          .min(1, {message: t('dateRequired')})
          .regex(ISO_DATE, {message: t('dateInvalid')}),
      ),
    notes: z.string(),
    status: z.enum(['pending', 'completed']),
  });
}

export type AddEditLogFormValues = z.output<
  ReturnType<typeof createAddEditLogFormSchema>
>;
