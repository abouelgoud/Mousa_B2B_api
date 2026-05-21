using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B2B_V2.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyCoordinatesAndRefactorRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BranchLocation",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "CandidateFullName",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "MobileNumber",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "NationalID",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Requests");

            migrationBuilder.AddColumn<Guid>(
                name: "CandidateId",
                table: "Requests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ScreeningBatchId",
                table: "Requests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "Companies",
                type: "decimal(18,10)",
                precision: 18,
                scale: 10,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "Companies",
                type: "decimal(18,10)",
                precision: 18,
                scale: 10,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Requests_CandidateId",
                table: "Requests",
                column: "CandidateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Requests_Candidates_CandidateId",
                table: "Requests",
                column: "CandidateId",
                principalTable: "Candidates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Requests_Candidates_CandidateId",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Requests_CandidateId",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "CandidateId",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "ScreeningBatchId",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Companies");

            migrationBuilder.AddColumn<string>(
                name: "BranchLocation",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CandidateFullName",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MobileNumber",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NationalID",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
