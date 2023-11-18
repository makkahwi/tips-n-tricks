import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InputsRow from "src/components/Form";
import SubmitButtons from "src/components/Form/SubmitButtons";
import { allValidatorsGenerator, initialValuesGenerator } from "./functions";

const ControlledForm = React.memo(
  ({
    inputs,
    data,
    extraValidations,
    customValidations,
    onSubmit,
    listInput,
    noCancel,
    noReset,
    submitText,
    goBack,
    withoutDelete,
    withoutEdit,
    fullWidth,
    noSubmit,
    disableForm,
    action,
  }) => {
    const { t } = useTranslation();
    const { withTable, onView, onDelete, onEdit, detailsPanel } = listInput;

    const [thereAreErrors, setThereAreErrors] = useState(false);

    const formik = useFormik({
      initialValues: {
        ...initialValuesGenerator({
          inputs: inputs({}).filter(({ excludeInForm }) => !excludeInForm),
        }),
        ...data,
      },
      validate: (formData) => {
        let errors = {};

        if (customValidations) {
          customValidations({ data: formData })?.forEach((validator) => {
            errors = { ...errors, ...validator };
          });
        } else {
          allValidatorsGenerator({
            data: formData,
            inputs: inputs({}).filter(({ excludeInForm }) => !excludeInForm),
          })?.forEach((validator) => {
            errors = { ...errors, ...validator };
          });

          extraValidations({ data: formData, errors })?.forEach((validator) => {
            errors = { ...errors, ...validator };
          });
        }

        if (
          Object.keys(errors)?.length &&
          action !== "delete" &&
          action !== "view"
        ) {
          setThereAreErrors(true);
        } else {
          setThereAreErrors(false);
        }

        return action === "delete" || action === "view" ? null : errors;
      },
      onSubmit: (formData) => {
        onSubmit(formData, formik);
      },
    });

    return (
      <form>
        <InputsRow
          formik={formik}
          inputs={inputs({ formik })
            .filter(({ excludeInForm }) => !excludeInForm)
            .map(({ hideInTable, ...rest }) => ({ ...rest }))
            .map((input) =>
              action === "delete" || action === "view"
                ? { ...input, required: false }
                : { ...input }
            )
            .map(({ disabled, ...input }) => ({
              ...input,
              disabled: disableForm || disabled,
            }))}
        />

        {thereAreErrors && (
          <div>
            <small className="text-danger">{t("ThereAreErrors")}</small>
          </div>
        )}

        <div>
          <SubmitButtons
            fullWidth={fullWidth}
            submitText={submitText}
            loader={!formik.values.viewMode}
            disableSubmit={formik.values.viewMode}
            onSubmit={formik.submitForm}
            noSubmit={noSubmit}
            noCancel={noCancel}
            back={goBack}
            onReset={
              !noReset ? () => formik.resetForm({ values: {} }) : undefined
            }
          />
        </div>
      </form>
    );
  }
);

ControlledForm.propTypes = {
  inputs: PropTypes.func,
  onSubmit: PropTypes.func,
  data: PropTypes.object,
  extraValidations: PropTypes.func,
  customValidations: PropTypes.func,
  listInput: PropTypes.object,
  noCancel: PropTypes.bool,
  noReset: PropTypes.bool,
  submitText: PropTypes.string,
  goBack: PropTypes.func,
  fullWidth: PropTypes.bool,
  withoutDelete: PropTypes.bool,
  withoutEdit: PropTypes.bool,
};

ControlledForm.defaultProps = {
  data: {},
  extraValidations: () => [],
  listInput: {},
  withoutDelete: false,
  withoutEdit: false,
};

export default ControlledForm;
