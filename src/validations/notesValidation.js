import { Segments, Joi } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteFields = {
  title: Joi.string().min(1),
  content: Joi.string().allow(''),
  tag: Joi.string().valid(...TAGS),
};

export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...TAGS),
    search: Joi.string().allow(''),
  }),
};

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom((value, helpers) =>
      isValidObjectId(value) ? value : helpers.error('any.invalid'),
    ).required(),
  }),
};

export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: noteFields.title.required(),
    content: noteFields.content,
    tag: noteFields.tag,
  }),
};

export const updateNoteSchema = {
  [Segments.PARAMS]: noteIdSchema[Segments.PARAMS],
  [Segments.BODY]: Joi.object(noteFields).min(1),
};
