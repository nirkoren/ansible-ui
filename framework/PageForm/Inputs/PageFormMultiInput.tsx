import {
  Button,
  Chip,
  ChipGroup,
  ChipGroupProps,
  InputGroup,
  TextInput,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import {
  Controller,
  FieldPath,
  FieldValues,
  PathValue,
  Validate,
  ValidationRule,
  useFormContext,
} from 'react-hook-form';
import styled from 'styled-components';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';

const ChipHolder = styled.div<{ isDisabled?: boolean }>`
  --pf-v5-c-form-control--Height: auto;
  background-color: ${(props: { isDisabled?: boolean }) =>
    props.isDisabled ? 'var(--pf-v5-global--disabled-color--300)' : null};
`;

export type PageFormMultiInputProps<
  T,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TFieldName;
  placeholder?: string;
  minLength?: number | ValidationRule<number>;
  maxLength?: number | ValidationRule<number>;
  pattern?: ValidationRule<RegExp>;
  validate?: Validate<T[], TFieldValues>;
  selectTitle?: string;
  isDisabled?: boolean;
  selectOpen?: (callback: (selection: T[]) => void, title: string) => void;
} & Omit<PageFormGroupProps, 'onChange' | 'value'> &
  ChipGroupProps;

interface FieldValuesWithArray<T> extends FieldValues {
  [key: string]: T[];
}

export function PageFormMultiInput<
  T extends {
    hostname?: string;
    id: number | string;
    name: string;
  },
  TFieldValues extends FieldValuesWithArray<T> = FieldValuesWithArray<T>,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormMultiInputProps<T, TFieldValues, TFieldName>) {
  const { validate, selectTitle, selectOpen, placeholder, ...formGroupInputProps } = props;
  const { label, name, isRequired, minLength, maxLength, pattern, isDisabled } = props;
  const {
    control,
    setValue,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();
  const [translations] = useFrameworkTranslations();

  const id = useID(props);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const removeItem = (item: T) => {
          onChange(value.filter((i) => i.id !== item.id));
        };

        return (
          <PageFormGroup
            {...formGroupInputProps}
            fieldId={id}
            helperTextInvalid={!(validate && isValidating) && error?.message}
          >
            <InputGroup>
              {value?.length ? (
                <ChipHolder
                  isDisabled={isSubmitting || isDisabled}
                  className="pf-v5-c-form-control"
                >
                  <ChipGroup
                    numChips={5}
                    expandedText={translations.showLess}
                    collapsedText={translations.countMore.replace(
                      '{count}',
                      `${value?.length - 5}`
                    )}
                  >
                    {value?.map((item) => (
                      <Chip key={item.id} onClick={() => removeItem(item)}>
                        {item.hostname ?? item.name}
                      </Chip>
                    ))}
                  </ChipGroup>
                </ChipHolder>
              ) : (
                <TextInput aria-label={placeholder} isDisabled placeholder={placeholder} />
              )}
              {selectTitle && (
                <Button
                  variant="control"
                  onClick={() =>
                    selectOpen?.((items: T[]) => {
                      setValue(name, items as unknown as PathValue<TFieldValues, TFieldName>, {
                        shouldValidate: true,
                      });
                    }, props.selectTitle as string)
                  }
                  aria-label="Options menu"
                  isDisabled={isSubmitting || isDisabled}
                >
                  <SearchIcon />
                </Button>
              )}
            </InputGroup>
          </PageFormGroup>
        );
      }}
      rules={{
        required:
          typeof label === 'string' && isRequired === true
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : undefined,

        minLength:
          typeof label === 'string' && typeof minLength === 'number'
            ? {
                value: minLength,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} must be at least ${minLength} characters.`,
              }
            : minLength,

        maxLength:
          typeof label === 'string' && typeof maxLength === 'number'
            ? {
                value: maxLength,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} cannot be greater than ${maxLength} characters.`,
              }
            : maxLength,

        pattern: pattern,
        validate: validate,
      }}
    />
  );
}
