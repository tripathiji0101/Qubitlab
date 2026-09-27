"""003_add_university_and_rag_tables

Revision ID: d5bf8f548aee
Revises: 071e33dbd300
Create Date: 2026-09-26 06:25:27.834197

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5bf8f548aee'
down_revision: Union[str, None] = '071e33dbd300'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Create University Tables ──
    op.create_table(
        'universities',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('domain', sa.String(length=255), nullable=True),
        sa.Column('logo', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('universities', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_universities_name'), ['name'], unique=False)
        batch_op.create_index(batch_op.f('ix_universities_domain'), ['domain'], unique=True)

    op.create_table(
        'university_memberships',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('university_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('role', sa.String(length=30), nullable=False, server_default='student'),
        sa.Column('department', sa.String(length=100), nullable=True),
        sa.Column('student_id_number', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['university_id'], ['universities.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('university_id', 'user_id', name='uq_univ_user_membership'),
    )
    with op.batch_alter_table('university_memberships', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_university_memberships_university_id'), ['university_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_university_memberships_user_id'), ['user_id'], unique=False)

    op.create_table(
        'courses',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('university_id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('academic_year', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['university_id'], ['universities.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('university_id', 'code', name='uq_course_univ_code'),
    )
    with op.batch_alter_table('courses', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_courses_university_id'), ['university_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_courses_code'), ['code'], unique=False)

    op.create_table(
        'subjects',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('course_id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('semester', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('subjects', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_subjects_course_id'), ['course_id'], unique=False)

    op.create_table(
        'units',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('subject_id', sa.String(length=36), nullable=False),
        sa.Column('unit_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('units', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_units_subject_id'), ['subject_id'], unique=False)

    op.create_table(
        'topics',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('unit_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('topics', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_topics_unit_id'), ['unit_id'], unique=False)

    op.create_table(
        'university_documents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('university_id', sa.String(length=36), nullable=False),
        sa.Column('uploaded_by', sa.String(length=36), nullable=True),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('subject_id', sa.String(length=36), nullable=True),
        sa.Column('course_id', sa.String(length=36), nullable=True),
        sa.Column('unit_id', sa.String(length=36), nullable=True),
        sa.Column('topic_id', sa.String(length=36), nullable=True),
        sa.Column('semester', sa.Integer(), nullable=True),
        sa.Column('academic_year', sa.String(length=20), nullable=True),
        sa.Column('content_type', sa.String(length=50), nullable=False, server_default='lecture_note'),
        sa.Column('file_format', sa.String(length=20), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('processing_status', sa.String(length=20), nullable=False, server_default='uploaded'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('chunk_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['university_id'], ['universities.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('university_documents', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_university_documents_university_id'), ['university_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_university_documents_uploaded_by'), ['uploaded_by'], unique=False)
        batch_op.create_index(batch_op.f('ix_university_documents_processing_status'), ['processing_status'], unique=False)

    op.create_table(
        'document_chunks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('document_id', sa.String(length=36), nullable=False),
        sa.Column('university_id', sa.String(length=36), nullable=False),
        sa.Column('course_id', sa.String(length=36), nullable=True),
        sa.Column('subject_id', sa.String(length=36), nullable=True),
        sa.Column('unit_id', sa.String(length=36), nullable=True),
        sa.Column('topic_id', sa.String(length=36), nullable=True),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('section_title', sa.String(length=255), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('embedding_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['university_documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['university_id'], ['universities.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('document_chunks', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_document_chunks_document_id'), ['document_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_document_chunks_university_id'), ['university_id'], unique=False)
        batch_op.create_index('ix_chunks_univ_search', ['university_id', 'course_id', 'subject_id'], unique=False)

    op.create_table(
        'ingestion_jobs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('document_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('progress', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['university_documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('ingestion_jobs', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_ingestion_jobs_document_id'), ['document_id'], unique=False)

    # ── 2. Update Users Table ──
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('university_id', sa.String(length=36), nullable=True))
        batch_op.add_column(sa.Column('university_role', sa.String(length=30), nullable=False, server_default='student'))
        batch_op.create_index(batch_op.f('ix_users_university_id'), ['university_id'], unique=False)
        batch_op.create_foreign_key('fk_users_university_id', 'universities', ['university_id'], ['id'], ondelete='SET NULL')

    # ── 3. Update Discussion Tables ──
    with op.batch_alter_table('discussion_posts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('university_id', sa.String(length=36), nullable=True))
        batch_op.create_index(batch_op.f('ix_discussion_posts_created_at'), ['created_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_discussion_posts_is_deleted'), ['is_deleted'], unique=False)
        batch_op.create_index('ix_discussion_posts_scope_deleted_created', ['scope', 'is_deleted', 'created_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_discussion_posts_university_id'), ['university_id'], unique=False)
        batch_op.create_foreign_key('fk_discussion_posts_university_id', 'universities', ['university_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('discussion_votes', schema=None) as batch_op:
        batch_op.create_unique_constraint('uq_discussion_votes_user_post', ['user_id', 'post_id'])


def downgrade() -> None:
    with op.batch_alter_table('discussion_votes', schema=None) as batch_op:
        batch_op.drop_constraint('uq_discussion_votes_user_post', type_='unique')

    with op.batch_alter_table('discussion_posts', schema=None) as batch_op:
        batch_op.drop_constraint('fk_discussion_posts_university_id', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_discussion_posts_university_id'))
        batch_op.drop_index('ix_discussion_posts_scope_deleted_created')
        batch_op.drop_index(batch_op.f('ix_discussion_posts_is_deleted'))
        batch_op.drop_index(batch_op.f('ix_discussion_posts_created_at'))
        batch_op.drop_column('university_id')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint('fk_users_university_id', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_users_university_id'))
        batch_op.drop_column('university_role')
        batch_op.drop_column('university_id')

    op.drop_table('ingestion_jobs')
    op.drop_table('document_chunks')
    op.drop_table('university_documents')
    op.drop_table('topics')
    op.drop_table('units')
    op.drop_table('subjects')
    op.drop_table('courses')
    op.drop_table('university_memberships')
    op.drop_table('universities')
