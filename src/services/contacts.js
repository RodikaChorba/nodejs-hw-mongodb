import { ContactsCollection } from '../db/models/contact.js';

export const getAllContacts = async () => {
  return await ContactsCollection.find();
};

export const getContactById = async (contactId) => {
  return await ContactsCollection.findById(contactId);
};

export const createContact = async (payload) => {
  return await ContactsCollection.create(payload);
};

export const deleteContact = async (contactId) => {
  return await ContactsCollection.findOneAndDelete({ _id: contactId });
};

export const updateContact = async (contactId, payload, options = {}) => {
  const updatedContact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      runValidators: true,
      omitUndefined: true,
      ...options,
    },
  );

  return updatedContact;
};
