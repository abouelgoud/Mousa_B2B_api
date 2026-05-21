using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B2B_V2.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkflowTimestamps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArrivedAt",
                table: "Requests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExamStartedAt",
                table: "Requests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SamplesCollectedAt",
                table: "Requests",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArrivedAt",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "ExamStartedAt",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "SamplesCollectedAt",
                table: "Requests");
        }
    }
}
