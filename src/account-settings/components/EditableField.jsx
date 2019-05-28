import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-i18n';
import { Button, Input, StatefulButton, ValidationFormGroup } from '@edx/paragon';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SwitchContent from './temp/SwitchContent';
import messages from '../AccountSettingsPage.messages';

import {
  openForm,
  closeForm,
} from '../actions';
import { editableFieldSelector } from '../selectors';


function EditableField(props) {
  const {
    name,
    label,
    emptyLabel,
    type,
    value,
    options,
    saveState,
    error,
    confirmationMessageDefinition,
    confirmationValue,
    helpText,
    onEdit,
    onCancel,
    onSubmit,
    onChange,
    isEditing,
    isEditable,
    intl,
    ...others
  } = props;
  const id = `field-${name}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name, new FormData(e.target).get(name));
  };

  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  const handleEdit = () => {
    onEdit(name);
  };

  const handleCancel = () => {
    onCancel(name);
  };

  const renderEmptyLabel = () => {
    if (isEditable) {
      return <Button onClick={handleEdit} className="btn-link p-0">{emptyLabel}</Button>;
    }
    return <span className="text-muted">{emptyLabel}</span>;
  };

  const renderValue = (rawValue) => {
    if (!rawValue) return renderEmptyLabel();

    if (options) {
      // Use == instead of === to prevent issues when HTML casts numbers as strings
      // eslint-disable-next-line eqeqeq
      const selectedOption = options.find(option => option.value == rawValue);
      if (selectedOption) return selectedOption.label;
    }

    return rawValue;
  };

  const renderConfirmationMessage = () => {
    if (!confirmationMessageDefinition || !confirmationValue) return null;
    return intl.formatMessage(confirmationMessageDefinition, {
      value: confirmationValue,
    });
  };

  return (
    <SwitchContent
      expression={isEditing ? 'editing' : 'default'}
      cases={{
        editing: (
          <form onSubmit={handleSubmit}>
            <ValidationFormGroup
              for={id}
              invalid={error != null}
              invalidMessage={error}
              helpText={helpText}
            >
              <label className="h6 d-block" htmlFor={id}>{label}</label>
              <Input
                name={name}
                id={id}
                type={type}
                value={value}
                onChange={handleChange}
                options={options}
                {...others}
              />
            </ValidationFormGroup>
            <p>
              <StatefulButton
                type="submit"
                className="btn-primary mr-2"
                state={saveState}
                labels={{
                  default: intl.formatMessage(messages['account.settings.editable.field.action.save']),
                }}
                onClick={(e) => {
                  // Swallow clicks if the state is pending.
                  // We do this instead of disabling the button to prevent
                  // it from losing focus (disabled elements cannot have focus).
                  // Disabling it would causes upstream issues in focus management.
                  // Swallowing the onSubmit event on the form would be better, but
                  // we would have to add that logic for every field given our
                  // current structure of the application.
                  if (saveState === 'pending') e.preventDefault();
                }}
                disabledStates={[]}
              />
              <Button
                onClick={handleCancel}
                className="btn-outline-primary"
              >
                {intl.formatMessage(messages['account.settings.editable.field.action.cancel'])}
              </Button>
            </p>
          </form>
        ),
        default: (
          <div className="form-group">
            <div className="d-flex align-items-start">
              <h6 aria-level="3">{label}</h6>
              {isEditable ? (
                <Button onClick={handleEdit} className="ml-3 btn-link">
                  <FontAwesomeIcon className="mr-1" icon={faPencilAlt} />{intl.formatMessage(messages['account.settings.editable.field.action.edit'])}
                </Button>
              ) : null}
            </div>
            <p>{renderValue(value)}</p>
            <p className="small text-muted mt-n2">{renderConfirmationMessage() || helpText}</p>
          </div>
        ),
      }}
    />
  );
}


EditableField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  emptyLabel: PropTypes.node,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
  saveState: PropTypes.oneOf(['default', 'pending', 'complete', 'error']),
  error: PropTypes.string,
  confirmationMessageDefinition: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
  confirmationValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  helpText: PropTypes.node,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isEditable: PropTypes.bool,
  intl: intlShape.isRequired,
};

EditableField.defaultProps = {
  value: undefined,
  options: undefined,
  saveState: undefined,
  label: undefined,
  emptyLabel: undefined,
  error: undefined,
  confirmationMessageDefinition: undefined,
  confirmationValue: undefined,
  helpText: undefined,
  isEditing: false,
  isEditable: true,
};


export default connect(editableFieldSelector, {
  onEdit: openForm,
  onCancel: closeForm,
})(injectIntl(EditableField));
